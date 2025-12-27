import { useEffect, useState } from "react";
import axios from "axios";

type PageItem = {
  key: string;
  title: string;
  type: string;
};

type Conteudo = {
  title: string;
  contentHtml: string;
};

export default function ConteudoControl() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [cmsKey, setCmsKey] = useState<string>("");

  const [data, setData] = useState<Conteudo>({
    title: "",
    contentHtml: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  const headers = token
    ? { Authorization: `Bearer ${token}` }
    : undefined;

  // =========================
  // LOAD LISTA DE CONTEÚDOS (SÓ HTML)
  // =========================
  async function loadPages() {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/cms`, {
        headers,
      });

      if (res.data?.ok && Array.isArray(res.data.data)) {
        // 👉 só conteúdos HTML (ignora configs)
        const onlyContents = res.data.data.filter(
          (item: PageItem) => item.type === "content"
        );

        setPages(onlyContents);

        if (onlyContents.length > 0) {
          setCmsKey(onlyContents[0].key);
        }
      }
    } catch {
      setErro("Erro ao carregar conteúdos do CMS.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD CONTEÚDO
  // =========================
  async function loadContent(key: string) {
    try {
      setLoading(true);
      setErro(null);
      setStatus(null);

      const res = await axios.get(
        `${BASE_URL}/api/admin/cms/content/${key}`,
        { headers }
      );

      if (res.data?.ok && res.data.data) {
        setData({
          title: res.data.data.title || "",
          contentHtml: res.data.data.contentHtml || "",
        });
      } else {
        setData({ title: "", contentHtml: "" });
        setStatus("Conteúdo ainda não cadastrado.");
      }
    } catch {
      setErro("Erro ao carregar conteúdo.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // SAVE
  // =========================
  async function saveContent() {
    try {
      setSalvando(true);
      setErro(null);
      setStatus(null);

      await axios.post(
        `${BASE_URL}/api/admin/cms/content`,
        {
          key: cmsKey,
          title: data.title,
          contentHtml: data.contentHtml,
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

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (cmsKey) loadContent(cmsKey);
  }, [cmsKey]);

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

  if (pages.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        Nenhum conteúdo HTML cadastrado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo HTML</h2>

      <p className="text-xs text-gray-500">
        Edita apenas conteúdos reais usados no app.
      </p>

      <select
        className="w-full rounded border p-2"
        value={cmsKey}
        onChange={(e) => setCmsKey(e.target.value)}
      >
        {pages.map((p) => (
          <option key={p.key} value={p.key}>
            {p.title || p.key}
          </option>
        ))}
      </select>

      {status && (
        <div className="text-sm text-gray-600">{status}</div>
      )}

      <input
        type="text"
        className="w-full rounded border p-2"
        placeholder="Título"
        value={data.title}
        onChange={(e) =>
          setData({ ...data, title: e.target.value })
        }
      />

      <textarea
        className="w-full h-48 rounded border p-2 font-mono text-sm"
        placeholder="HTML do conteúdo"
        value={data.contentHtml}
        onChange={(e) =>
          setData({ ...data, contentHtml: e.target.value })
        }
      />

      <button
        onClick={saveContent}
        disabled={salvando}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Salvar Conteúdo"}
      </button>
    </div>
  );
}