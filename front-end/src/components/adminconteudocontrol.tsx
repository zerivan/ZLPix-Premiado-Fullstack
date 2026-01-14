import { useEffect, useState } from "react";
import axios from "axios";

type CmsArea = {
  key: string;
  title: string;
};

type CmsPage = {
  page: string;
  title: string;
};

/**
 * 🔒 MAPA FIXO DO LAYOUT (ESTRUTURA APENAS)
 * ❌ NÃO CONTÉM HTML
 */
const CMS_LAYOUT_MAP: Record<string, CmsArea[]> = {
  home: [
    { key: "home_info", title: "Home › Header › Subtítulo" },
    { key: "home_card_info", title: "Home › Card do Prêmio › Texto Informativo" },
    { key: "home_extra_info", title: "Home › Seção Extra › Texto" },
    { key: "home_footer", title: "Home › Rodapé › Como Funciona" },
  ],
};

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState("");
  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
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
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/pages`,
        { headers }
      );

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

      const layoutAreas = CMS_LAYOUT_MAP[page] || [];
      setAreas(layoutAreas);
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

  useEffect(() => {
    if (pageKey) loadAreas(pageKey);
  }, [pageKey]);

  if (loading) return <p>Carregando conteúdo…</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">CMS — Estrutura de Conteúdo</h2>

      {erro && <div className="text-red-600 text-sm">{erro}</div>}

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

      {loadingAreas && (
        <p className="text-sm text-gray-500">Carregando áreas…</p>
      )}

      <div className="space-y-2">
        {areas.map((area) => (
          <button
            key={area.key}
            onClick={() => setActiveArea(area)}
            className={`block w-full text-left p-2 border rounded ${
              activeArea?.key === area.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            {area.title}
          </button>
        ))}
      </div>

      {activeArea && (
        <div className="text-sm text-gray-600 border-t pt-3">
          Área selecionada: <strong>{activeArea.title}</strong>
          <br />
          <span className="italic">
            (Editor será conectado aqui na próxima etapa)
          </span>
        </div>
      )}
    </div>
  );
}