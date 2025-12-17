// src/pages/home.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

/**
 * Datas
 */
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

function daysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  // =========================
  // CMS — Conteúdos dinâmicos
  // =========================
  const [homeTitle, setHomeTitle] = useState("ZLPIX PREMIADO 💰");
  const [homeSubtitle, setHomeSubtitle] = useState(
    "Concorra toda quarta-feira com a Loteria Federal 🎯"
  );
  const [homeInfoHtml, setHomeInfoHtml] = useState<string | null>(null);

  // 🔐 BLOQUEIA ACESSO ADMIN À HOME
  useEffect(() => {
    const adminToken = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (adminToken) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  // =========================
  // CARREGA CONTEÚDO DO CMS
  // =========================
  useEffect(() => {
    async function loadContent() {
      try {
        // Título e subtítulo da Home
        const homeText = await api.get(
          "/api/federal/admin/content/home_text"
        );
        if (homeText.data?.ok && homeText.data.data) {
          setHomeTitle(homeText.data.data.title || homeTitle);
          setHomeSubtitle(
            homeText.data.data.contentHtml || homeSubtitle
          );
        }

        // Texto "Como funciona"
        const howToPlay = await api.get(
          "/api/federal/admin/content/how_to_play"
        );
        if (howToPlay.data?.ok && howToPlay.data.data) {
          setHomeInfoHtml(howToPlay.data.data.contentHtml);
        }
      } catch {
        // fallback silencioso
      }
    }

    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const premioAtual = "R$ 500.00";

  const proximoSorteio = getNextWednesday();
  const diasFaltando = daysUntil(proximoSorteio);

  const dataSorteio = proximoSorteio.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      {/* HEADER */}
      <header className="text-center py-7 border-b border-white/10 shadow-md">
        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
          {homeTitle}
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          {homeSubtitle}
        </p>
      </header>

      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">
        {/* CARD PRÊMIO */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-yellow-400/30 w-full max-w-md">
          <p className="text-yellow-300 text-sm mb-1">
            Prêmio acumulado
          </p>

          <h2 className="text-4xl font-extrabold drop-shadow-sm">
            {premioAtual}
          </h2>

          <p className="text-sm text-blue-100 mt-2">
            Próximo sorteio:{" "}
            <span className="text-yellow-300 font-semibold">
              {dataSorteio}
            </span>
          </p>

          <div className="mt-3 text-xs text-blue-100/80">
            ⏳ Faltam{" "}
            <span className="text-yellow-300 font-semibold">
              {diasFaltando} dias
            </span>{" "}
            • Sorteio sempre às quartas
          </div>
        </div>

        {/* BOTÃO */}
        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          whileTap={{ scale: 0.92 }}
          className="bg-gradient-to-r from-yellow-400 to-green-400 text-blue-900 font-extrabold text-lg px-10 py-3 rounded-full shadow-xl w-full max-w-md"
          onClick={() => navigate("/aposta")}
        >
          🎯 FAZER APOSTA AGORA
        </motion.button>

        {/* TEXTO FIXO (pode virar CMS depois) */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm text-white/90 shadow-inner w-full max-w-md leading-relaxed">
          Você concorre do <strong>1º ao 5º prêmio</strong> da Loteria Federal.
          Se suas dezenas aparecerem em{" "}
          <strong>qualquer uma das centenas sorteadas</strong>,
          seu bilhete é premiado!
        </div>

        {/* COMO FUNCIONA */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-full shadow-md transition-all"
          >
            {showInfo ? "Fechar explicação" : "Como funciona o jogo 🎯"}
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-lg space-y-4 w-full text-left text-sm"
              >
                {homeInfoHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: homeInfoHtml }}
                  />
                ) : (
                  <p>
                    Conteúdo explicativo não configurado ainda.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}