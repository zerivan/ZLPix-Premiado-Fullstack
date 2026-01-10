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

  // 🔑 estado SEPARADO para editor / preview
  const [editorHtml, setEditorHtml] = useState("");

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

      const res = await axios.get(`${BASE_URL}/api/admin/cms/pages`, { headers });
      if (res.data?.ok) {
        setPages(res.data.pages);
        setPageKey(res.data.pages[0]?.page || "");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAreas(page: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);
      setEditorHtml("");

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

      setAreas((prev) =>
        prev.map((a) =>
          a.key === activeArea.key ? { ...a, contentHtml: editorHtml } : a
        )
      );

      setStatus("Conteúdo salvo com sucesso.");
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

  useEffect(() => {
    if (!activeArea) return;

    loadTinyMCE().then(() => {
      const tinymce = (window as any).tinymce;
      tinymce.remove("#cms-editor");

      tinymce.init({
        selector: "#cms-editor",
        height: 320,
        menubar: false,
        plugins: "link lists table code",
        toolbar:
          "undo redo | bold italic underline | bullist numlist | link table | code",
        setup(editor: any) {
          editor.on("Change KeyUp", () => {
            setEditorHtml(editor.getContent());
          });
          editor.on("init", () => {
            editor.setContent(editorHtml);
          });
        },
      });
    });

    return () => {
      const tinymce = (window as any).tinymce;
      if (tinymce) tinymce.remove("#cms-editor");
    };
  }, [activeArea?.key]);

  if (loading) return <p>Carregando…</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Conteúdo</h2>

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

      {areas.map((area) => (
        <button
          key={area.key}
          className="block w-full text-left border p-2"
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
          <textarea id="cms-editor" />

          <button
            onClick={salvarArea}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Salvar
          </button>

          <div className="border p-4">
            <strong>Preview</strong>
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: editorHtml }}
            />
          </div>
        </>
      )}
    </div>
  );
}