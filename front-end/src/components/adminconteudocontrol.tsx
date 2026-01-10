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

// =========================
// LOAD TINYMCE VIA CDN
// =========================
function loadTinyMCE(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).tinymce) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.tiny.cloud/1/nodl6plzej0qovadyg591uo9gano2pp30y989zuoyep0jy5g/tinymce/8/tinymce.min.js";
    script.referrerPolicy = "origin";
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();

    document.head.appendChild(script);
  });
}

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
      setErro(null);

      const headers = getHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/areas/${page}`,
        { headers }
      );

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
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      await axios.post(
        `${BASE_URL}/api/admin/cms/area/save`,
        {
          key: activeArea.key,
          title: activeArea.title,
          contentHtml: activeArea.contentHtml,
        },
        { headers }
      );

      // 🔑 sincroniza frontend
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

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (pageKey) loadAreas(pageKey);
  }, [pageKey]);

  // =========================
  // INIT TINYMCE
  // =========================
  useEffect(() => {
    if (!activeArea) return;

    let destroyed = false;

    loadTinyMCE().then(() => {
      if (destroyed) return;

      const tinymce = (window as any).tinymce;

      tinymce.remove("#cms-editor");

      tinymce.init({
        selector: "#cms-editor",
        height: 300,
        menubar: false,
        plugins:
          "anchor autolink charmap codesample emoticons link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange formatpainter pageembed a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode advtemplate tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
        toolbar:
          "undo redo | blocks fontfamily fontsize | bold italic underline | align | bullist numlist | link table | preview code",
        setup(editor: any) {
          editor.on("Change KeyUp", () => {
            setActiveArea((prev) =>
              prev ? { ...prev, contentHtml: editor.getContent() } : prev
            );
          });

          editor.on("init", () => {
            editor.setContent(activeArea.contentHtml || "");
          });
        },
      });
    });

    return () => {
      destroyed = true;
      const tinymce = (window as any).tinymce;
      if (tinymce) tinymce.remove("#cms-editor");
    };
  }, [activeArea?.key]);

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando conteúdo…</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo do Site</h2>

      {erro && <div className="text-sm text-red-600">{erro}</div>}
      {status && <div className="text-sm text-green-600">{status}</div>}

      <select
        className="border p-2 w-full"
        value={pageKey}
        onChange={(e) => setPageKey(e.target.value)}
      >
        <option value="">Selecione uma página</option>
        {pages.map((p) => (
          <option key={p.page} value={p.page}>
            {p.title}
          </option>
        ))}
      </select>

      {loadingAreas && (
        <div className="text-sm text-gray-500">Carregando áreas…</div>
      )}

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
          className={`block w-full text-left p-2 rounded border ${
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

          {/* TinyMCE controla este textarea */}
          <textarea id="cms-editor" className="hidden" />

          <button
            onClick={salvarArea}
            disabled={salvando}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar Conteúdo"}
          </button>

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