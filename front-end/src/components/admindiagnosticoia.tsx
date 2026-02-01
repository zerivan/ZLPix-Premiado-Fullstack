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
  const [copiadoIndex, setCopiadoIndex] = useState<number | null>(null);

  // 🔥 NOVO ESTADO PARA ZIP
  const [arquivoZip, setArquivoZip] = useState<File | null>(null);

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
    } catch {
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

  // 🔥 NOVA FUNÇÃO: ENVIAR ZIP
  async function enviarZip() {
    if (!arquivoZip || loading) return;

    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) {
      setErro("Token de administrador ausente.");
      return;
    }

    setErro(null);
    setLoading(true);

    setMensagens((prev) => [
      ...prev,
      { role: "user", content: `📦 Enviado arquivo: ${arquivoZip.name}` },
    ]);

    try {
      const formData = new FormData();
      formData.append("file", arquivoZip);

      const res = await axios.post(
        `${BASE_URL}/api/admin/diagnostico-ia`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            res.data?.resposta ||
            "Diagnóstico concluído.",
        },
      ]);

      setArquivoZip(null);
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Erro ao enviar ZIP. Verifique o backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function copiarTexto(texto: string, index: number) {
    navigator.clipboard.writeText(texto);
    setCopiadoIndex(index);
    setTimeout(() => setCopiadoIndex(null), 1200);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Diagnóstico IA
      </h2>

      <div className="h-80 overflow-y-auto rounded border bg-gray-50 p-3 space-y-3">
        {mensagens.length === 0 && (
          <div className="text-sm text-gray-500">
            Faça uma pergunta técnica ou envie um ZIP do projeto.
          </div>
        )}

        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={`relative rounded p-3 text-sm ${
              msg.role === "user"
                ? "bg-indigo-600 text-white ml-auto max-w-[80%]"
                : "bg-white border max-w-[80%]"
            }`}
          >
            {msg.content}

            {msg.role === "assistant" && (
              <button
                onClick={() =>
                  copiarTexto(msg.content, i)
                }
                className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
              >
                {copiadoIndex === i
                  ? "Copiado!"
                  : "Copiar"}
              </button>
            )}
          </div>
        ))}
      </div>

      {erro && (
        <div className="text-sm text-red-600">
          {erro}
        </div>
      )}

      {/* 🔥 NOVO BLOCO DE UPLOAD */}
      <div className="space-y-2 border-t pt-3">
        <input
          type="file"
          accept=".zip"
          onChange={(e) =>
            setArquivoZip(e.target.files?.[0] || null)
          }
          className="text-sm"
        />

        <button
          onClick={enviarZip}
          disabled={!arquivoZip || loading}
          className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar ZIP para Diagnóstico"}
        </button>
      </div>

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