import { useEffect, useState } from "react";
import axios from "axios";
import EditorQuill from "../../editor/EditorQuill";

type CmsArea = {
  key: string;
  title: string;
};

type CmsFolder = {
  label: string;
  areas: CmsArea[];
};

type CmsPage = {
  page: string;
  title: string;
};

/**
 * 📁 ORGANIZAÇÃO LÓGICA DO CMS (UI ONLY)
 * ❌ NÃO ALTERA BACKEND
 * ❌ NÃO ALTERA BANCO
 */
const CMS_FOLDERS: Record<string, CmsFolder[]> = {
  home: [
    {
      label: "Informações",
      areas: [
        { key: "home_info", title: "Header › Texto Informativo" },
        { key: "home_extra_info", title: "Seção Extra › Texto" },
        { key: "home_footer", title: "Rodapé › Como Funciona" },
      ],
    },
    {
      label: "Bilhetes",
      areas: [
        {
          key: "home_card_info",
          title: "Card do Prêmio › Texto Informativo",
        },
      ],
    },
  ],
  resultado: [
    {
      label: "Resultados",
      areas: [{ key: "resultado_info", title: "Resultado › Informações" }],
    },
  ],
  pix: [
    {
      label: "PIX",
      areas: [{ key: "pix_info", title: "PIX › Informações" }],
    },
  ],
  perfil: [
    {
      label: "Perfil",
      areas: [{ key: "perfil_info", title: "Perfil › Informações" }],
    },
  ],
  carteira: [
    {
      label: "Carteira",
      areas: [{ key: "carteira_info", title: "Carteira › Informações" }],
    },
  ],
};

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState("");
  const [folders, setFolders] = useState<CmsFolder[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);
  const [initialHtml, setInitialHtml] = useState("");

  const [loading, setLoading] = useState(true);
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

  function loadFolders(page: string) {
    setActiveArea(null);
    setInitialHtml("");
    setFolders(CMS_FOLDERS[page] || []);
  }

  async function loadAreaContent(area: CmsArea) {
    try {
      const headers = getHeaders();
      if (!headers) return;

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${pageKey}`,
        { headers }
      );

      const found = res.data?.areas?.find(
        (a: any) => a.key === area.key
      );

      setInitialHtml(found?.contentHtml || "");
    } catch {
      setInitialHtml("");
    }
  }

  async function salvarConteudo(html: string) {
    const headers = getHeaders();
    if (!headers || !activeArea) return;

    await axios.post(
      `${BASE_URL}/api/admin/cms/area/save`,
      {
        key: activeArea.key,
        title: activeArea.title,
        contentHtml: html,
      },
      { headers }
    );
  }

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pageKey) loadFolders(pageKey);
  }, [pageKey]);

  useEffect(() => {
    if (activeArea) loadAreaContent(activeArea);
  }, [activeArea]);

  if (loading) return <p>Carregando conteúdo…</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">CMS — Conteúdo do Site</h2>

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

      {folders.map((folder) => (
        <div key={folder.label} className="border rounded">
          <div className="bg-gray-100 px-3 py-2 font-semibold text-sm">
            📁 {folder.label}
          </div>

          <div className="p-2 space-y-1">
            {folder.areas.map((area) => (
              <button
                key={area.key}
                onClick={() => setActiveArea(area)}
                className={`block w-full text-left p-2 rounded border ${
                  activeArea?.key === area.key
                    ? "bg-indigo-600 text-white"
                    : "bg-white"
                }`}
              >
                {area.title}
              </button>
            ))}
          </div>
        </div>
      ))}

      {activeArea && (
        <EditorQuill
          page={pageKey}
          areaKey={activeArea.key}
          areaTitle={activeArea.title}
          initialHtml={initialHtml}
          onSave={salvarConteudo}
        />
      )}
    </div>
  );
}