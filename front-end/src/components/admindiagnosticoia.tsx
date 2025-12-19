import { useState } from "react";

export default function AdminDiagnosticoIA() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function analisar() {
    if (!pergunta.trim()) {
      setErro("Descreva o problema antes de analisar.");
      return;
    }

    setLoading(true);
    setErro(null);
    setResposta(null);

    try {
      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      if (!token) {
        throw new Error("Sessão do administrador expirada. Faça login novamente.");
      }

      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/diagnostico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ pergunta })
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Erro ${res.status} ao consultar IA: ${text || "sem resposta"}`
        );
      }

      const data = await res.json();

      if (!data?.ok) {
        throw new Error(data?.erro || "Resposta inválida da IA");
      }

      setResposta(data.resposta);
    } catch (e: any) {
      setErro(e.message || "Erro inesperado ao consultar a IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Diagnóstico com IA</h2>

      <p className="text-sm text-gray-600">
        Descreva o problema do sistema e a IA fará uma análise técnica.
      </p>

      <textarea
        className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
        rows={4}
        placeholder="Ex: O painel admin não abre após o login..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={analisar}
          disabled={loading}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Analisando..." : "Analisar com IA"}
        </button>

        {erro && <span className="text-sm text-red-600">{erro}</span>}
      </div>

      {resposta && (
        <div className="rounded bg-gray-50 p-3 text-sm text-gray-800">
          <strong>Resposta da IA:</strong>
          <pre className="mt-2 whitespace-pre-wrap">{resposta}</pre>
        </div>
      )}
    </div>
  );
}