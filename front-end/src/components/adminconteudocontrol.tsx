import { useEffect, useState } from "react";
import axios from "axios";

type CmsArea = {
  key: string;
  title: string;
  contentHtml: string;
};

type CmsPage = {
  key: string;
  page: string;
  title: string;
};

export default function ConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState<string>("");

  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

  function getAuthHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // =========================
  // LOAD PÁGINAS
  // =========================
  async function loadPages() {
    try {
      const headers = getAuthHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/cms`, { headers });

      if (res.data?.ok && Array.isArray(res.data.data)) {
        setPages(res.data.data);

        if (res.data.data.length > 0) {
          const first = res.data.data[0];
          // ✅ USAR PAGE (compatível com CMS_AREAS.page)
          setPageKey(first.page);
        }
      }
    } catch {
      setErro("Erro ao carregar páginas do CMS.");
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
      setErro(null);
      setStatus(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/content/${page}`,
        { headers }
      );

      if (res.data?.ok && Array.isArray(res.data.data)) {
        setAreas(res.data.data);
        setActiveArea(res.data.data[0] || null);
      } else {
        setAreas([]);
        setActiveArea(null);
      }
    } catch {
      setErro("Erro ao carregar conteúdo da página.");
    } finally {
      setLoadingAreas(false);
    }
  }

  // =========================
  // SAVE ÁREA
  // =========================
  async function saveContent() {
    if (!activeArea) return;

    try {
      setSalvando(true);
      setErro(null);
      setStatus(null);

      const headers = getAuthHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/admin/cms/content`,
        {
          key: activeArea.key,
          title: activeArea.title,
          contentHtml: activeArea.contentHtml,
        },
        { headers }
      );

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

  // =========================
  // RENDER
  // =========================
  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando conteúdo do CMS...
      </div>
    );
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo do App</h2>

      {/* SELECT DE PÁGINAS */}
      <select
        className="w-full rounded border p-2"
        value={pageKey}
        onChange={(e) => setPageKey(e.target.value)}
      >
        {pages.map((p) => (
          <option key={p.key} value={p.page}>
            {p.title}
          </option>
        ))}
      </select>

      {loadingAreas && (
        <div className="text-sm text-gray-500 animate-pulse">
          Carregando áreas…
        </div>
      )}

      {!loadingAreas && areas.length > 0 && (
        <select
          className="w-full rounded border p-2"
          value={activeArea?.key}
          onChange={(e) =>
            setActiveArea(
              areas.find((a) => a.key === e.target.value) || null
            )
          }
        >
          {areas.map((a) => (
            <option key={a.key} value={a.key}>
              {a.title}
            </option>
          ))}
        </select>
      )}

      {status && <div className="text-sm text-green-600">{status}</div>}

      {activeArea && (
        <>
          <input
            type="text"
            className="w-full rounded border p-2"
            value={activeArea.title}
            onChange={(e) =>
              setActiveArea({ ...activeArea, title: e.target.value })
            }
          />

          <textarea
            className="w-full h-48 rounded border p-2 font-mono text-sm"
            value={activeArea.contentHtml}
            onChange={(e) =>
              setActiveArea({ ...activeArea, contentHtml: e.target.value })
            }
          />

          <button
            onClick={saveContent}
            disabled={salvando}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Conteúdo"}
          </button>
        </>
      )}
    </div>
  );
}