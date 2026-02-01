import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";
import logo from "@/assets/images/logos/logo.png";
import bannerHome from "@/assets/images/banners/banner-home.png";

/**
Ajusta ISO UTC para data BR
*/
function formatarDataBR(iso: string) {
  const d = new Date(iso);
  d.setHours(d.getHours() - 3);
  return d.toLocaleDateString("pt-BR");
}

/**
REGRA OFICIAL:
Sorteio só vira depois das 17h da quarta-feira
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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24 relative">

      <motion.div
        className="w-full max-w-md mt-5 overflow-hidden rounded-xl border border-yellow-300/30 pt-12 pb-4 px-4 relative bg-cover bg-center min-h-[180px]"
        style={{ backgroundImage: `url(${bannerHome})` }}
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
          style={{ width: "fit-content" }}
        >
          🧝‍♂️💰
        </motion.span>

        <p className="text-yellow-300 font-bold text-sm">
          🎉 Agora é com você! Escolha suas três dezenas, confirme sua aposta e aguarde o sorteio oficial da Loteria Federal. O próximo resultado pode ser o seu momento.
        </p>
      </motion.div>

      <NavBottom />
    </div>
  );
}