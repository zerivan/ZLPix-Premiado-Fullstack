import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

/**
 * Utils
 */
function formatarDataBR(iso: string) {
  const d = new Date(iso);
  d.setHours(d.getHours() - 3);
  return d.toLocaleDateString("pt-BR");
}

function hasVisibleHtml(html: string | null) {
  if (!html) return false;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
  return text.length > 0;
}

type CmsArea = {
  key: string;
  contentHtml: string;
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // MODO CMS
  // =========================
  const isCmsMode =
    location.pathname.startsWith("/admin/editor") &&
    !!localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingHtml, setEditingHtml] = useState<string>("");

  async function salvarCms(key: string, html: string) {
    await api.post(
      "/api/admin/cms",
      { key, contentHtml: html },
      {
        headers: {
          Authorization:
            "Bearer " + localStorage.getItem("TOKEN_ZLPIX_ADMIN"),
        },
      }
    );
  }

  function startEdit(key: string, html: string) {
    if (!isCmsMode) return;
    setEditingKey(key);
    setEditingHtml(html);
  }

  function finishEdit() {
    if (!editingKey) return;
    salvarCms(editingKey, editingHtml);
    setEditingKey(null);
  }

  // =========================
  // DADOS AUTOMÁTICOS
  // =========================
  const [premioAtual, setPremioAtual] = useState<string>("R$ 500");
  const [dataSorteio, setDataSorteio] = useState<string>("");

  // =========================
  // CMS
  // =========================
  const [cms, setCms] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const federal = await api.get("/api/federal");
        if (federal.data?.ok && federal.data.data?.proximoSorteio) {
          setDataSorteio(formatarDataBR(federal.data.data.proximoSorteio));
        }

        const premio = await api.get("/api/cms/public/premio");
        if (premio.data?.ok && typeof premio.data.valor === "number") {
          setPremioAtual(`R$ ${premio.data.valor}`);
        }

        const cmsRes = await api.get("/api/cms/public/home");
        if (cmsRes.data?.ok && Array.isArray(cmsRes.data.data)) {
          const map: Record<string, string> = {};
          cmsRes.data.data.forEach((a: CmsArea) => {
            map[a.key] = a.contentHtml;
          });
          setCms(map);
        }
      } catch {}
    }

    loadData();
  }, []);

  function CmsBlock({
    k,
    className,
  }: {
    k: string;
    className?: string;
  }) {
    const html = cms[k];
    if (!hasVisibleHtml(html)) return null;

    const isEditing = editingKey === k;

    return (
      <div
        className={`${className} ${
          isCmsMode ? "outline outline-1 outline-yellow-400/40 cursor-pointer" : ""
        }`}
        onClick={() => startEdit(k, html)}
      >
        {isEditing ? (
          <div
            contentEditable
            suppressContentEditableWarning
            className="bg-black/30 p-2 rounded"
            onBlur={finishEdit}
            onInput={(e) =>
              setEditingHtml((e.target as HTMLElement).innerHTML)
            }
            dangerouslySetInnerHTML={{ __html: editingHtml }}
          />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-7 border-b border-white/10 shadow-md">
        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>
      </header>

      <CmsBlock
        k="home_info"
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm shadow-inner w-full max-w-md mx-auto mt-6"
      />

      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-yellow-400/30 w-full max-w-md">
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

          <CmsBlock
            k="home_card_info"
            className="mt-4 text-sm text-white/90 leading-relaxed"
          />
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

        <CmsBlock
          k="home_extra_info"
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm shadow-inner w-full max-w-md leading-relaxed"
        />

        <AnimatePresence>
          <CmsBlock
            k="home_footer"
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-lg space-y-4 w-full max-w-md"
          />
        </AnimatePresence>
      </main>

      <NavBottom />
    </div>
  );
}