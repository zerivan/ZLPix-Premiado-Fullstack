import { useState } from "react";
import { Copy, Trash2, Send } from "lucide-react";

export default function AdminDiagnosticoIA() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function analisar() {
    if (!pergunta.trim()) {
      setErro("Descreva o problema antes de analisar.");
      return;
    }

    setLoading(true);
    setErro(null);
    setResposta(null);
    setCopiado(false);

    try {
      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      if (!token) {
        throw new Error("Sessão do administrador expirada. Faça login novamente.");
      }

      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/api/admin/diagnostico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ pergunta })
        }
      );

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.erro || "Falha ao consultar a IA");
      }

      setResposta(data.resposta);
    } catch (e: any) {
      setErro(e.message || "Erro inesperado ao consultar a IA");
    } finally {
      setLoading(false);
    }
  }

  function copiarResposta() {
    if (!resposta) return;
    navigator.clipboard.writeText(resposta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function limparTudo() {
    setPergunta("");
    setResposta(null);
    setErro(null);
    setCopiado(false);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Diagnóstico com IA</h2>

      <p className="text-sm text-gray-600">
        Descreva o problema do sistema. Você pode editar a pergunta e reenviar
        quantas vezes quiser.
      </p>

      {/* PERGUNTA */}
      <textarea
        className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
        rows={4}
        placeholder="Ex: O painel admin não renderiza após o login..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      {/* AÇÕES */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={analisar}
          disabled={loading}
          className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          <Send size={16} />
          {loading ? "Analisando..." : "Analisar"}
        </button>

        <button
          onClick={limparTudo}
          type="button"
          className="flex items-center gap-2 rounded border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          <Trash2 size={16} />
          Limpar
        </button>

        {erro && <span className="text-sm text-red-600">{erro}</span>}
      </div>

      {/* RESPOSTA */}
      {resposta && (
        <div className="rounded-lg border bg-gray-50 p-4 text-sm text-gray-800 space-y-3">
          <div className="flex justify-between items-center">
            <strong>Resposta da IA</strong>

            <button
              onClick={copiarResposta}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
            >
              <Copy size={14} />
              {copiado ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <pre className="whitespace-pre-wrap leading-relaxed">
            {resposta}
          </pre>
        </div>
      )}
    </div>
  );
}