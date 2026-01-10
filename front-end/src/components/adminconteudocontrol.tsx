import { useEffect, useState } from "react";
import axios from "axios";

type CmsArea = {
  key: string;
  title: string;
  contentHtml: string;
};

type CmsPage = {
  page: string;
  title: string;
};

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState("");

  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  // 🔑 HTML PURO = fonte da verdade
  const [editorHtml, setEditorHtml] = useState("");

  // 🔄 força reload do iframe
  const [iframeKey, setIframeKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  function getHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  // =========================
  // LOAD PÁGINAS
  // =========================
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

  // =========================
  // LOAD ÁREAS
  // =========================
  async function loadAreas(page: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);
      setEditorHtml("");
      setStatus(null);

      const headers = getHeaders();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${page}`,
        { headers }
      );

      setAreas(res.data?.areas || []);
    } catch {
      setErro("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }

  // =========================
  // SAVE ÁREA
  // =========================
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

      // 🔄 força reload do iframe (preview real)
      setIframeKey((k) => k + 1);

      setStatus("Conteúdo salvo com sucesso.");
    } catch {
      setErro("Erro ao salvar conteúdo.");
    } finally {
      setSalvando(false);
    }
  }

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pageKey) loadAreas(pageKey);
  }, [pageKey]);

  if (loading) return <p>Carregando conteúdo…</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ===== COLUNA ESQUERDA — CMS ===== */}
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

        {loadingAreas && <p>Carregando áreas…</p>}

        {areas.map((area) => (
          <button
            key={area.key}
            className={`block w-full text-left p-2 border rounded ${
              activeArea?.key === area.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
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
              HTML da área: {activeArea.title}
            </label>

            <textarea
              className="w-full h-48 border p-2 font-mono text-sm"
              value={editorHtml}
              onChange={(e) => setEditorHtml(e.target.value)}
              placeholder="<p>Digite o HTML aqui</p>"
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

      {/* ===== COLUNA DIREITA — PREVIEW REAL ===== */}
      <div className="border rounded overflow-hidden">
        <div className="bg-gray-800 text-white text-sm px-3 py-2">
          Preview real da página
        </div>

        <iframe
          key={iframeKey}
          src={`${BASE_URL}/?preview=1`}
          className="w-full h-[80vh] bg-white"
        />
      </div>
    </div>
  );
}