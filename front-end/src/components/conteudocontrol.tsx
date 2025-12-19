import { useEffect, useState } from "react";

type Conteudo = {
  title: string;
  contentHtml: string;
};

function adminHeaders() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default function ConteudoControl() {
  const CMS_KEY = "home";

  const [data, setData] = useState<Conteudo>({
    title: "",
    contentHtml: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  // =========================
  // LOAD CONTEÚDO (CMS)
  // =========================
  async function loadContent() {
    try {
      setLoading(true);
      setErro(null);

      const res = await fetch(
        `https://zlpix-premiado-backend.onrender.com/api/federal/content/${CMS_KEY}`,
        { headers: adminHeaders() }
      );

      if (!res.ok) {
        throw new Error("Falha ao buscar conteúdo");
      }

      const json = await res.json();

      if (json?.ok && json.data) {
        setData({
          title: json.data.title || "",
          contentHtml: json.data.contentHtml || "",
        });
      } else {
        setStatus("Nenhum conteúdo cadastrado ainda.");
      }
    } catch (e) {
      setErro("Erro ao carregar conteúdo do CMS");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // SAVE CONTEÚDO (ADMIN)
  // =========================
  async function saveContent() {
    setSalvando(true);
    setErro(null);
    setStatus(null);

    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/federal/admin/content",
        {
          method: "POST",
          headers: adminHeaders(),
          body: JSON.stringify({
            key: CMS_KEY,
            title: data.title,
            contentHtml: data.contentHtml,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao salvar");
      }

      setStatus("Conteúdo salvo com sucesso.");
    } catch {
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
        <div className="text-sm text-green-600">{status}</div>
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