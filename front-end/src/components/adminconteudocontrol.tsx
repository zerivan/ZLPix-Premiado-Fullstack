import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import Quill from "quill";
import "react-quill/dist/quill.snow.css";

/* =========================
   REGISTRO DE FONTES (QUILL)
========================= */
const Font = Quill.import("formats/font");

Font.whitelist = [
  "inter",
  "poppins",
  "montserrat",
  "bebas",
  "oswald",
  "roboto",
];

Quill.register(Font, true);

/* =========================
   TOOLBAR COMPLETA
========================= */
const QUILL_MODULES = {
  toolbar: [
    [{ font: Font.whitelist }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

type CmsArea = {
  key: string;
  title: string;
  contentHtml: string;
};

type CmsPage = {
  page: string;
  title: string;
};

/**
 * 🔒 MAPA FIXO DO LAYOUT
 */
const CMS_LAYOUT_MAP: Record<string, CmsArea[]> = {
  home: [
    { key: "home_info", title: "Home › Header › Subtítulo", contentHtml: "" },
    { key: "home_card_info", title: "Home › Card do Prêmio › Texto Informativo", contentHtml: "" },
    { key: "home_extra_info", title: "Home › Seção Extra › Texto", contentHtml: "" },
    { key: "home_footer", title: "Home › Rodapé › Como Funciona", contentHtml: "" },
  ],
};

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState("");
  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);
  const [editorHtml, setEditorHtml] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;
  const SITE_URL = window.location.origin;

  function getHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  async function loadPages() {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const res = await axios.get(`${BASE_URL}/api/admin/cms/pages`, { headers });
      if (res.data?.ok) {
        setPages(res.data.pages);
        setPageKey(res.data.pages[0]?.page || "");
      }
    } catch {
      setErro("Erro ao carregar páginas.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAreas(page: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);
      setEditorHtml("");
      setStatus(null);

      const headers = getHeaders();
      if (!headers) return;

      const layoutAreas = CMS_LAYOUT_MAP[page] || [];

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${page}`,
        { headers }
      );

      const savedAreas: CmsArea[] = res.data?.areas || [];

      const merged = layoutAreas.map((area) => {
        const saved = savedAreas.find((s) => s.key === area.key);
        return { ...area, contentHtml: saved?.contentHtml || "" };
      });

      setAreas(merged);
    } catch {
      setErro("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }

  async function salvarArea() {
    if (!activeArea) return;

    try {
      setSalvando(true);
      setErro(null);
      setStatus(null);

      const headers = getHeaders();
      if (!headers) return;

      await axios.post(
        `${BASE_URL}/api/admin/cms/area/save`,
        {
          key: activeArea.key,
          title: activeArea.title,
          contentHtml: editorHtml,
        },
        { headers }
      );

      await loadAreas(pageKey);
      setIframeKey((k) => k + 1);
      setStatus("Conteúdo salvo com sucesso.");
    } catch {
      setErro("Erro ao salvar conteúdo.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pageKey) loadAreas(pageKey);
  }, [pageKey]);

  if (loading) return <p>Carregando conteúdo…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Conteúdo do Site</h2>

        {erro && <div className="text-red-600 text-sm">{erro}</div>}
        {status && <div className="text-green-600 text-sm">{status}</div>}

        <select
          className="border p-2 w-full"
          value={pageKey}
          onChange={(e) => setPageKey(e.target.value)}
        >
          {pages.map((p) => (
            <option key={p.page} value={p.page}>
              {p.title}
            </option>
          ))}
        </select>

        {areas.map((area) => (
          <button
            key={area.key}
            className={`block w-full text-left p-2 border rounded ${
              activeArea?.key === area.key ? "bg-indigo-600 text-white" : "bg-gray-100"
            }`}
            onClick={() => {
              setActiveArea(area);
              setEditorHtml(area.contentHtml || "");
            }}
          >
            {area.title}
          </button>
        ))}

        {activeArea && (
          <>
            <label className="text-sm font-medium">
              Conteúdo: {activeArea.title}
            </label>

            <ReactQuill
              theme="snow"
              value={editorHtml}
              onChange={setEditorHtml}
              modules={QUILL_MODULES}
            />

            <button
              onClick={salvarArea}
              disabled={salvando}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              {salvando ? "Salvando..." : "Salvar Conteúdo"}
            </button>
          </>
        )}
      </div>

      <div className="border rounded overflow-hidden">
        <div className="bg-gray-800 text-white text-sm px-3 py-2">
          Preview real da página
        </div>

        <iframe
          key={iframeKey}
          src={`${SITE_URL}/?preview=1`}
          className="w-full h-[80vh] bg-white"
        />
      </div>
    </div>
  );
}