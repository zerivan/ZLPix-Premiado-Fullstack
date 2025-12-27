// src/pages/home.tsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

/**
 * Ajusta ISO UTC para data BR
 */
function formatarDataBR(iso: string) {
  const d = new Date(iso);
  d.setHours(d.getHours() - 3);
  return d.toLocaleDateString("pt-BR");
}

/**
 * Formata valor monetário
 */
function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  // =========================
  // PRÊMIO DINÂMICO
  // =========================
  const [premioAtual, setPremioAtual] = useState<number | null>(null);
  const [dataSorteio, setDataSorteio] = useState<string>("");

  // =========================
  // CMS — HTML EDITÁVEL
  // =========================
  const [cmsHtml, setCmsHtml] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        /**
         * 🔹 PRÊMIO ATUAL (backend oficial)
         */
        const premioRes = await api.get("/api/admin/apuracao/premio-atual");
        if (premioRes.data?.ok) {
          setPremioAtual(premioRes.data.data.premioAtual);

          if (premioRes.data.data.proximoSorteio) {
            setDataSorteio(
              formatarDataBR(premioRes.data.data.proximoSorteio)
            );
          }
        }

        /**
         * 🔹 HTML DA HOME (CMS)
         */
        const cmsRes = await api.get("/api/admin/cms/content/home");
        if (cmsRes.data?.ok && cmsRes.data.data?.contentHtml) {
          setCmsHtml(cmsRes.data.data.contentHtml);
        }
      } catch {
        // silencioso — Home não quebra
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">
      {/* 🏆 Cabeçalho */}
      <header className="text-center py-7 border-b border-white/10 shadow-md">
        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>
      </header>

      {/* 🧩 CMS — HTML EDITÁVEL */}
      {cmsHtml && (
        <div
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm text-white/90 shadow-inner w-full max-w-md mx-auto mt-6"
          dangerouslySetInnerHTML={{ __html: cmsHtml }}
        />
      )}

      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">
        {/* 💎 CARD DO PRÊMIO */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-yellow-400/30 w-full max-w-md">
          <p className="text-yellow-300 text-sm mb-1">
            Prêmio acumulado
          </p>

          <h2 className="text-4xl font-extrabold drop-shadow-sm">
            {premioAtual !== null
              ? formatarMoeda(premioAtual)
              : "Carregando..."}
          </h2>

          {dataSorteio && (
            <p className="text-sm text-blue-100 mt-2">
              Próximo sorteio:{" "}
              <span className="text-yellow-300 font-semibold">
                {dataSorteio}
              </span>
            </p>
          )}
        </div>

        {/* 🎯 BOTÃO */}
        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          whileTap={{ scale: 0.92 }}
          className="bg-gradient-to-r from-yellow-400 to-green-400 text-blue-900 font-extrabold text-lg px-10 py-3 rounded-full shadow-xl w-full max-w-md"
          onClick={() => navigate("/aposta")}
        >
          🎯 FAZER APOSTA AGORA
        </motion.button>

        {/* 📢 INFO */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm text-white/90 shadow-inner w-full max-w-md leading-relaxed">
          Você concorre do <strong>1º ao 5º prêmio</strong> da Loteria Federal.
          Se suas dezenas aparecerem em{" "}
          <strong>qualquer uma das centenas sorteadas</strong>,
          seu bilhete é premiado!
        </div>

        {/* 📘 COMO FUNCIONA */}
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-full shadow-md"
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
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-lg space-y-4 w-full"
              >
                <p className="text-sm text-white/90 leading-relaxed">
                  🎯 Você concorre com <strong>3 dezenas</strong> por bilhete.
                  Se alguma delas aparecer nas centenas sorteadas,
                  seu bilhete é premiado.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}