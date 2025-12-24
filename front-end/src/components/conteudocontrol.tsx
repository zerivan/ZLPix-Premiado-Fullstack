import { useEffect, useState } from "react";
import axios from "axios";

type Conteudo = {
  title: string;
  contentHtml: string;
};

export default function ConteudoControl() {
  const CMS_KEY = "home";

  const [data, setData] = useState<Conteudo>({
    title: "",
    contentHtml: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // =========================
  // LOAD
  // =========================
  async function loadContent() {
    try {
      setLoading(true);
      setErro(null);
      setStatus(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        `https://zlpix-premiado-fullstack.onrender.com/api/admin/cms/content/${CMS_KEY}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data?.ok && res.data.data) {
        setData({
          title: res.data.data.title || "",
          contentHtml: res.data.data.contentHtml || "",
        });
      } else {
        setStatus("Conteúdo ainda não cadastrado.");
      }
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar conteúdo do CMS.");
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

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      await axios.post(
        "https://zlpix-premiado-fullstack.onrender.com/api/admin/cms/content",
        {
          key: CMS_KEY,
          title: data.title,
          contentHtml: data.contentHtml,
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      setStatus("Conteúdo salvo com sucesso.");
    } catch (e) {
      console.error(e);
      setErro("Erro ao salvar conteúdo.");
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

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

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo da Página</h2>

      <p className="text-xs text-gray-500">
        Este conteúdo é exibido no aplicativo e pode ser editado diretamente
        pelo painel administrativo.
      </p>

      {status && (
        <div className="text-sm text-gray-600">{status}</div>
      )}

      <input
        type="text"
        className="w-full rounded border p-2"
        placeholder="Título da página"
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