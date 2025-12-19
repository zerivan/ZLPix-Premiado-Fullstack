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
      const res = await fetch("/diagnostico", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pergunta }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.erro || "Falha ao consultar a IA");
      }

      setResposta(data.resposta);
    } catch (e: any) {
      setErro(e.message || "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold">Diagnóstico com IA</h2>

      <p className="mb-3 text-sm text-gray-600">
        Descreva o problema do sistema e a IA fará uma análise técnica.
      </p>

      <textarea
        className="w-full resize-none rounded-xl border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
        rows={4}
        placeholder="Ex: O painel admin não abre após o login..."
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={analisar}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Analisando..." : "Analisar com IA"}
        </button>

        {erro && <span className="text-sm text-red-600">{erro}</span>}
      </div>

      {resposta && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm text-gray-800">
          <strong>Resposta da IA:</strong>
          <pre className="mt-2 whitespace-pre-wrap">{resposta}</pre>
        </div>
      )}
    </div>
  );
}