import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

/**
Ajusta ISO UTC para data BR
*/
function formatarDataBR(iso: string) {
  const d = new Date(iso);
  d.setHours(d.getHours() - 3);
  return d.toLocaleDateString("pt-BR");
}

/**
🔥 NOVA REGRA DE TIMELINE
Sorteios válidos: quarta e sábado
Só vira após 20h
*/
function ajustarDataSorteio(iso: string) {
  return formatarDataBR(iso);
}

function hasVisibleHtml(html: string | null) {
  if (!html) return false;

  const text = html
    .replace(/<[^>]*>/g, "")
    .replace(/ /g, "")
    .trim();

  return text.length > 0;
}

const COMO_FUNCIONA_FALLBACK = `
<h3 class="text-yellow-300 font-bold text-lg">🎯 Como Jogar</h3>
<p><strong>O bilhete é composto por 03 (três) dezenas de 00 a 99.</strong></p>
<p>
É permitido repetir dezenas. A data do sorteio constará no bilhete.
</p>
<p>
As dezenas são extraídas com base nos 5 primeiros prêmios da
<strong>Loteria Federal</strong>, considerando apenas:
</p>
<ul class="list-disc pl-5">
<li>Dezena inicial (dois primeiros números)</li>
<li>Dezena final (dois últimos números)</li>
</ul>
<p>
Exemplo: 7590 → 75 e 90
</p>
<p>
Não são consideradas dezenas intermediárias.
</p>
<p>
Ganha quem acertar as 3 dezenas escolhidas dentro das dezenas válidas do sorteio.
</p>
<p>
Se ninguém acertar, o prêmio acumula para o próximo sorteio.
Havendo mais de um ganhador, o valor será dividido igualmente.
</p>
<hr class="border-white/20"/>
<p class="text-center font-bold text-yellow-300">
🎯 Clique em Apostar, escolha suas dezenas e boa sorte!
</p>
`;

type CmsArea = {
  key: string;
  contentHtml: string;
};

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

        // 🔥 NOVO: prêmio vindo direto do backend (fonte única)
        const premio = await api.get("/api/app/premio");
        if (premio.data?.ok) {
          const valor = Number(premio.data.valor);

          if (!isNaN(valor) && valor > 0) {
            setPremioAtual(`R$ ${valor.toFixed(2)}`);
          }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24 relative">

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-6 right-5 text-2xl z-50"
      >
        ☰
      </button>

      {menuOpen && (
        <div className="absolute top-14 right-5 bg-white text-black rounded-xl shadow-lg w-56 z-50">
          <div className="flex flex-col text-sm">
            <Link to="/politica-privacidade" className="px-4 py-3 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
              Política de Privacidade
            </Link>
            <Link to="/termos-de-uso" className="px-4 py-3 hover:bg-gray-100 border-t" onClick={() => setMenuOpen(false)}>
              Termos de Uso
            </Link>
            <Link to="/login" className="px-4 py-3 hover:bg-gray-100 border-t" onClick={() => setMenuOpen(false)}>
              Área do Usuário
            </Link>
          </div>
        </div>
      )}

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

          <p className="text-sm text-white/90 mt-3 font-semibold">
            Concorra do 1º ao 5º prêmio da Loteria Federal. Apuração 100% vinculada aos resultados oficiais.
          </p>

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

        <motion.div
          className="w-full max-w-md mt-5 overflow-hidden rounded-xl bg-white/10 border border-yellow-300/30 pt-12 pb-4 px-4 relative"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 7.5, repeat: Infinity }}
        >
          <motion.span
            animate={{ x: ["0%", "100%"] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            className="absolute top-2 left-0 text-2xl"
          >
            🧝‍♂️💰
          </motion.span>

          <p className="text-yellow-300 font-bold text-sm">
            🎉 Agora é com você! Escolha suas três dezenas, confirme sua aposta e aguarde o sorteio oficial da Loteria Federal. O próximo resultado pode ser o seu momento.
          </p>
        </motion.div>

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