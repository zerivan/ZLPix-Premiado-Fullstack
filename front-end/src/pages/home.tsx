import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

/* ... funções utilitárias mantidas sem alteração ... */

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "1";

  const [premioAtual, setPremioAtual] = useState<string>("R$ 500");
  const [dataSorteio, setDataSorteio] = useState<string>("");

  const [homeCardInfoHtml, setHomeCardInfoHtml] = useState<string | null>(null);
  const [homeExtraInfoHtml, setHomeExtraInfoHtml] = useState<string | null>(null);
  const [homeFooterHtml, setHomeFooterHtml] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const federal = await api.get("/api/federal");
        if (federal.data?.ok && federal.data.data?.proximoSorteio) {
          setDataSorteio(
            ajustarDataSorteio(federal.data.data.proximoSorteio)
          );
        }

        const premio = await api.get("/api/cms/public/premio");
        if (premio.data?.ok && typeof premio.data.valor === "number") {
          setPremioAtual(`R$ ${premio.data.valor}`);
        }

        const cms = await api.get(
          isPreview
            ? "/api/cms/preview/home?token=preview"
            : "/api/cms/public/home"
        );

        if (cms.data?.ok && Array.isArray(cms.data.data)) {
          const areas = cms.data.data;

          setHomeCardInfoHtml(
            areas.find((a: any) => a.key === "home_card_info")?.contentHtml || null
          );
          setHomeExtraInfoHtml(
            areas.find((a: any) => a.key === "home_extra_info")?.contentHtml || null
          );
          setHomeFooterHtml(
            areas.find((a: any) => a.key === "home_footer")?.contentHtml || null
          );
        }
      } catch {}
    }

    loadData();
  }, [isPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24 relative">
      
      <header className="relative text-center py-7 border-b border-white/10 shadow-md">
        
        {/* BOTÃO MENU SUPERIOR DIREITO */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="absolute right-4 top-6 text-white text-2xl"
        >
          ☰
        </button>

        {/* DROPDOWN MENU */}
        {menuOpen && (
          <div className="absolute right-4 top-14 bg-white text-black rounded-xl shadow-lg w-52 z-50">
            <div className="flex flex-col text-sm">
              <Link
                to="/politica-privacidade"
                className="px-4 py-3 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Política de Privacidade
              </Link>

              <Link
                to="/login"
                className="px-4 py-3 hover:bg-gray-100 border-t"
                onClick={() => setMenuOpen(false)}
              >
                Área do Usuário
              </Link>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-extrabold text-yellow-300">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>
      </header>

      {/* restante do código mantido exatamente igual */}

      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">
        {/* conteúdo original preservado */}
      </main>

      <NavBottom />
    </div>
  );
}