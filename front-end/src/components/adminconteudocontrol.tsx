import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
  const [pageKey, setPageKey] = useState<string>("");

  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  const [editorHtml, setEditorHtml] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  function getAuthHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  // =========================
  // LOAD PAGES
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
        const pagesMap: Record<string, CmsPage> = {};

        res.data.data.forEach((item: any) => {
          if (!pagesMap[item.page]) {
            pagesMap[item.page] = {
              page: item.page,
              title:
                item.page.charAt(0).toUpperCase() +
                item.page.slice(1),
            };
          }
        });

        const pageList = Object.values(pagesMap);
        setPages(pageList);
        if (pageList.length > 0) setPageKey(pageList[0].page);
      }
    } catch {
      setErro("Erro ao carregar páginas do CMS.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD AREAS
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
      setAreas([]);
      setActiveArea(null);
    } finally {
      setLoadingAreas(false);
    }
  }

  // =========================
  // SYNC EDITOR
  // =========================
  useEffect(() => {
    if (activeArea) setEditorHtml(activeArea.contentHtml || "");
    else setEditorHtml("");
  }, [activeArea]);

  // =========================
  // SAVE
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
          contentHtml: editorHtml,
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

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse">
        Carregando conteúdo do CMS...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo do App</h2>

      {erro && <div className="text-sm text-red-600">{erro}</div>}
      {status && <div className="text-sm text-green-600">{status}</div>}

      {/* PÁGINAS */}
      <select
        className="w-full rounded border p-2"
        value={pageKey}
        onChange={(e) => setPageKey(e.target.value)}
      >
        {pages.map((p) => (
          <option key={p.page} value={p.page}>
            {p.title}
          </option>
        ))}
      </select>

      {/* ÁREAS */}
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

      {/* EDITOR */}
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

          <ReactQuill
            theme="snow"
            value={editorHtml}
            onChange={setEditorHtml}
            className="bg-white"
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