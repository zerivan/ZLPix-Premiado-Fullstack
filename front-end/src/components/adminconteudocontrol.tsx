import React, { useEffect, useState, Suspense } from "react";
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

// 🔥 ReactQuill carregado SOB DEMANDA (React precisa existir!)
const ReactQuill = React.lazy(() => import("react-quill"));

// 🔥 CSS do Quill carregado só quando necessário
function loadQuillCss() {
  if (document.getElementById("quill-css")) return;

  const link = document.createElement("link");
  link.id = "quill-css";
  link.rel = "stylesheet";
  link.href =
    "https://cdn.jsdelivr.net/npm/react-quill@2.0.0/dist/quill.snow.css";
  document.head.appendChild(link);
}

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState<string>("");

  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  function getHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  async function loadPages() {
    try {
      const headers = getHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/cms/pages`, {
        headers,
      });

      if (res.data?.ok && Array.isArray(res.data.pages)) {
        setPages(res.data.pages);
        if (res.data.pages.length > 0) {
          setPageKey(res.data.pages[0].page);
        }
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
      setErro(null);

      const headers = getHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/cms/areas/${page}`, {
        headers,
      });

      if (res.data?.ok && Array.isArray(res.data.areas)) {
        setAreas(res.data.areas);
      } else {
        setAreas([]);
      }
    } catch {
      setErro("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gerenciar Conteúdo</h1>

      {erro && <p className="text-red-600">{erro}</p>}

      {loading ? (
        <p>Carregando páginas...</p>
      ) : (
        <>
          {pages.length > 0 && (
            <select
              value={pageKey}
              onChange={(e) => {
                const newPage = e.target.value;
                setPageKey(newPage);
                loadAreas(newPage);
              }}
              className="border p-2 rounded"
            >
              {pages.map((p) => (
                <option key={p.page} value={p.page}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          {loadingAreas ? (
            <p className="mt-4">Carregando áreas...</p>
          ) : (
            <div className="mt-4 space-y-4">
              {areas.map((area) => (
                <div
                  key={area.key}
                  className="border rounded p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    loadQuillCss();
                    setActiveArea(area);
                  }}
                >
                  <h2 className="font-semibold">{area.title}</h2>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: area.contentHtml }}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeArea && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">{activeArea.title}</h2>

          <Suspense fallback={<p>Carregando editor...</p>}>
            <ReactQuill
              theme="snow"
              value={activeArea.contentHtml}
              onChange={(html) =>
                setActiveArea({ ...activeArea, contentHtml: html })
              }
            />
          </Suspense>

          <button
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      )}
    </div>
  );
}
