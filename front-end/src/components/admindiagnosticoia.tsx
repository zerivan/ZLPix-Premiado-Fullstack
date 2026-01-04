import { useState } from "react";
import axios from "axios";

type Mensagem = {
  role: "user" | "assistant";
  content: string;
};

const BASE_URL = "https://zlpix-premiado-fullstack.onrender.com";

export default function AdminDiagnosticoIA() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviarPergunta() {
    if (!input.trim() || loading) return;

    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) {
      setErro("Token de administrador ausente.");
      return;
    }

    const pergunta = input;
    setInput("");
    setErro(null);

    setMensagens((prev) => [
      ...prev,
      { role: "user", content: pergunta },
    ]);

    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/api/admin/ia/chat`,
        { mensagem: pergunta },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            res.data?.resposta ||
            "A IA não retornou uma resposta.",
        },
      ]);
    } catch (e) {
      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Erro ao se comunicar com a IA. Verifique o backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Diagnóstico IA — Assistente do Projeto
      </h2>

      <div className="h-80 overflow-y-auto rounded border bg-gray-50 p-3 space-y-3">
        {mensagens.length === 0 && (
          <div className="text-sm text-gray-500">
            Faça uma pergunta técnica sobre o projeto ZLPix
            (prêmio, CMS, abas, regras, erros…)
          </div>
        )}

        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`rounded p-3 text-sm ${
              msg.role === "user"
                ? "bg-indigo-600 text-white ml-auto max-w-[80%]"
                : "bg-white border max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {erro && (
        <div className="text-sm text-red-600">{erro}</div>
      )}

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Pergunte algo para a IA…"
          className="flex-1 rounded border p-2 text-sm"
        />

        <button
          onClick={enviarPergunta}
          disabled={loading}
          className="rounded bg-indigo-600 px-4 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Pensando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
