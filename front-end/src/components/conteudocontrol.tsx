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

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // =========================
  // LOAD
  // =========================
  async function loadContent() {
    try {
      const res = await fetch(
        `https://zlpix-premiado-backend.onrender.com/api/federal/content/${CMS_KEY}`,
        { headers: adminHeaders() }
      );

      const json = await res.json();

      if (json?.ok && json.data) {
        setData({
          title: json.data.title || "",
          contentHtml: json.data.contentHtml || "",
        });
      }
    } catch {
      setStatus("Erro ao carregar conteúdo");
    }
  }

  // =========================
  // SAVE
  // =========================
  async function saveContent() {
    setLoading(true);
    setStatus(null);

    try {
      await fetch(
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

      setStatus("Conteúdo salvo com sucesso");
    } catch {
      setStatus("Erro ao salvar conteúdo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Conteúdo da Página</h2>

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
        disabled={loading}
        className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Salvar Conteúdo"}
      </button>
    </div>
  );
}