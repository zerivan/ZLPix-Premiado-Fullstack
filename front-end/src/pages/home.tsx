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
 * REGRA OFICIAL:
 * - Sorteio só vira depois das 17h da quarta-feira
 */
function ajustarDataSorteio(iso: string) {
  const agora = new Date();
  const diaSemana = agora.getDay();
  const hora = agora.getHours();

  const dataApi = new Date(iso);

  if (diaSemana === 3 && hora < 17) {
    const corrigida = new Date(dataApi);
    corrigida.setDate(corrigida.getDate() - 7);
    return formatarDataBR(corrigida.toISOString());
  }

  return formatarDataBR(iso);
}

function hasVisibleHtml(html: string | null) {
  if (!html) return false;

  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();

  return text.length > 0;
}

/**
 * 🔒 FALLBACK FIXO — NUNCA SOME
 */
const COMO_FUNCIONA_FALLBACK = `
<h3 class="text-yellow-300 font-bold text-lg">🎯 Como funciona o jogo</h3>
<p>
Você escolhe até <strong>3 dezenas</strong> entre <strong>00 e 99</strong>.
Cada bilhete concorre automaticamente no próximo sorteio da
<strong>Loteria Federal</strong>.
</p>
<p>
Se suas dezenas coincidirem com as dezenas premiadas do
<strong>1º ao 5º prêmio</strong>, você ganha!
</p>
<p>
O prêmio é <strong>dividido automaticamente</strong> entre os ganhadores
e o valor cai direto na sua carteira 💰
</p>
<p class="text-xs text-white/70">
Sorteios toda quarta-feira às 17h.
</p>
`;

type CmsArea = {
  key: string;
  contentHtml: string;
};

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

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
          const areas: CmsArea[] = cms.data.data;

          setHomeCardInfoHtml(
            areas.find((a) => a.key === "home_card_info")?.contentHtml || null
          );
          setHomeExtraInfoHtml(
            areas.find((a) => a.key === "home_extra_info")?.contentHtml || null
          );
          setHomeFooterHtml(
            areas.find((a) => a.key === "home_footer")?.contentHtml || null
          );
        }
      } catch {}
    }

    loadData();
  }, [isPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-7 border-b border-white/10 shadow-md">
        <h1 className="text-3xl font-extrabold text-yellow-300">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>
      </header>

      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">
        <div className="bg-white/10 rounded-2xl p-6 shadow-lg w-full max-w-md">
          <p className="text-yellow-300 text-sm mb-1">Prêmio acumulado</p>
          <h2 className="text-4xl font-extrabold">{premioAtual}</h2>

          {dataSorteio && (
            <p className="text-sm text-blue-100 mt-2">
              Próximo sorteio:{" "}
              <span className="text-yellow-300 font-semibold">
                {dataSorteio}
              </span>
            </p>
          )}

          {hasVisibleHtml(homeCardInfoHtml) && (
            <div
              className="mt-4 text-sm text-white/90"
              dangerouslySetInnerHTML={{ __html: homeCardInfoHtml! }}
            />
          )}
        </div>

        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          whileTap={{ scale: 0.92 }}
          className="bg-gradient-to-r from-yellow-400 to-green-400 text-blue-900 font-extrabold text-lg px-10 py-3 rounded-full shadow-xl w-full max-w-md"
          onClick={() => navigate("/aposta")}
        >
          🎯 FAZER APOSTA AGORA
        </motion.button>

        {hasVisibleHtml(homeExtraInfoHtml) && (
          <div
            className="bg-white/10 rounded-xl p-5 text-sm text-white/90 w-full max-w-md"
            dangerouslySetInnerHTML={{ __html: homeExtraInfoHtml! }}
          />
        )}

        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-full"
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
                className="bg-white/10 rounded-2xl p-5 shadow-lg space-y-4 w-full"
                dangerouslySetInnerHTML={{
                  __html: hasVisibleHtml(homeFooterHtml)
                    ? homeFooterHtml!
                    : COMO_FUNCIONA_FALLBACK,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}