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
  key: string;
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

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  // =========================
  // LOAD PÁGINAS
  // =========================
  async function loadPages() {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/pages`,
        { headers }
      );

      if (res.data?.ok) {
        setPages(res.data.pages || []);
      }
    } catch {
      setErro("Erro ao carregar páginas.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD ÁREAS DA PÁGINA
  // =========================
  async function loadAreas(key: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${key}`,
        { headers }
      );

      if (res.data?.ok) {
        setAreas(res.data.areas || []);
      }
    } catch {
      setErro("Erro ao carregar áreas.");
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
      setStatus(null);

      await axios.post(
        `${BASE_URL}/api/admin/cms/area/save`,
        activeArea,
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
    return <div className="text-sm text-gray-500">Carregando conteúdo...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo do Site</h2>

      {erro && <div className="text-sm text-red-600">{erro}</div>}
      {status && <div className="text-sm text-green-600">{status}</div>}

      {/* PÁGINAS */}
      <select
        className="border p-2 w-full"
        value={pageKey}
        onChange={(e) => setPageKey(e.target.value)}
      >
        <option value="">Selecione uma página</option>
        {pages.map((p) => (
          <option key={p.key} value={p.key}>
            {p.title}
          </option>
        ))}
      </select>

      {/* ÁREAS */}
      {loadingAreas && (
        <div className="text-sm text-gray-500">Carregando áreas…</div>
      )}

      {areas.map((area) => (
        <button
          key={area.key}
          onClick={() => setActiveArea(area)}
          className={`block w-full text-left p-2 rounded border ${
            activeArea?.key === area.key
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          {area.title}
        </button>
      ))}

      {/* EDITOR */}
      {activeArea && (
        <div className="space-y-4">
          <h3 className="font-semibold">{activeArea.title}</h3>

          <ReactQuill
            theme="snow"
            value={activeArea.contentHtml}
            onChange={(html) =>
              setActiveArea({ ...activeArea, contentHtml: html })
            }
          />

          <button
            onClick={salvarArea}
            disabled={salvando}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Conteúdo"}
          </button>

          {/* ========================= */}
          {/* PREVIEW SIMPLES (NOVO) */}
          {/* ========================= */}
          <div className="border rounded p-4 bg-gray-50">
            <h4 className="text-sm font-semibold mb-2">
              Preview da Página
            </h4>

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: activeArea.contentHtml,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}