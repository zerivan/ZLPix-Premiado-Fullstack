import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify"; // 🔒 Sanitização do HTML

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
    } catch (err) {
      console.error("Erro ao carregar páginas:", err);
      setErro("Erro ao carregar páginas.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD ÁREAS DA PÁGINA
  // =========================
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
    } catch (err) {
      console.error("Erro ao carregar áreas:", err);
      setErro("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }

  // =========================
  // EFEITOS INICIAIS
  // =========================
  useEffect(() => {
    loadPages();
  }, []);

  // =========================
  // RETORNO DO COMPONENTE
  // =========================
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Gerenciar Conteúdo</h1>

      {erro && <p className="text-red-600">{erro}</p>}

      {loading ? (
        <p>Carregando páginas...</p>
      ) : (
        <div>
          <p className="mb-2">
            Páginas carregadas: <strong>{pages.length}</strong>
          </p>

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
                  onClick={() => setActiveArea(area)}
                >
                  <h2 className="font-semibold">{area.title}</h2>
                  <div
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(area.contentHtml),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeArea && (
        <div className="mt-6 border-t pt-4">
          <h2 className="font-semibold text-lg mb-2">{activeArea.title}</h2>
          <ReactQuill
            theme="snow"
            value={activeArea.contentHtml}
            onChange={(html) =>
              setActiveArea({ ...activeArea, contentHtml: html })
            }
          />
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