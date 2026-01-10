import { useEffect, useState } from "react";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";

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

  async function loadPages() {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/pages`,
        { headers }
      );

      if (res.data?.ok) {
        setPages(res.data.pages);
        if (res.data.pages.length > 0) {
          setPageKey(res.data.pages[0].page);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAreas(page: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);

      const headers = getHeaders();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${page}`,
        { headers }
      );

      setAreas(res.data?.areas || []);
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
        activeArea,
        { headers }
      );

      setAreas((prev) =>
        prev.map((a) =>
          a.key === activeArea.key
            ? { ...a, contentHtml: activeArea.contentHtml }
            : a
        )
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
    return <div className="text-sm text-gray-500">Carregando…</div>;
  }

  return (
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

      {loadingAreas && <div>Carregando áreas…</div>}

      {areas.map((area) => (
        <button
          key={area.key}
          onClick={() =>
            setActiveArea({
              key: area.key,
              title: area.title,
              contentHtml: area.contentHtml || "",
            })
          }
          className={`block w-full text-left p-2 rounded ${
            activeArea?.key === area.key
              ? "bg-indigo-600 text-white"
              : "bg-gray-100"
          }`}
        >
          {area.title}
        </button>
      ))}

      {activeArea && (
        <div className="space-y-4">
          <h3 className="font-semibold">{activeArea.title}</h3>

          <Editor
            value={activeArea.contentHtml}
            onEditorChange={(content) =>
              setActiveArea((prev) =>
                prev ? { ...prev, contentHtml: content } : prev
              )
            }
            init={{
              height: 300,
              menubar: false,
              plugins:
                "lists link image preview code fullscreen",
              toolbar:
                "undo redo | bold italic | bullist numlist | link | preview | code",
            }}
          />

          <button
            onClick={salvarArea}
            disabled={salvando}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {salvando ? "Salvando..." : "Salvar Conteúdo"}
          </button>

          <div className="border p-4 bg-gray-50 rounded">
            <h4 className="text-sm font-semibold mb-2">Preview</h4>
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