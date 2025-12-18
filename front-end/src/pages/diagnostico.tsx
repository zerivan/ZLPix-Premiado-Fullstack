import { useState } from "react";

export default function DiagnosticoIA() {
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [loading, setLoading] = useState(false);

  async function perguntar() {
    if (!pergunta.trim()) return;

    setLoading(true);
    setResposta("");

    try {
      const res = await fetch(
        "https://zlpix-premiado-backend.onrender.com/diagnostico",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pergunta }),
        }
      );

      const json = await res.json();

      if (json.ok) {
        setResposta(json.resposta);
      } else {
        setResposta("Erro ao obter diagnóstico.");
      }
    } catch (err) {
      setResposta("Falha de conexão com a IA.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Diagnóstico Inteligente do Sistema
      </h1>

      <textarea
        className="w-full border p-3 rounded mb-3"
        rows={5}
        placeholder="Ex: Por que o AdminDashboard não reflete o CMS da Home?"
        value={pergunta}
        onChange={(e) => setPergunta(e.target.value)}
      />

      <button
        onClick={perguntar}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Analisando..." : "Perguntar à IA"}
      </button>

      {resposta && (
        <div className="mt-6 bg-white p-4 rounded shadow whitespace-pre-wrap">
          {resposta}
        </div>
      )}
    </div>
  );
}