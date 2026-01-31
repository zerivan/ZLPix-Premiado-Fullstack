import { useEffect, useState } from "react";
import axios from "axios";

type Ganhador = {
  id: number;
  userId: number;
  nome: string;
  dezenas: string;
  premio: number;
  status: string;
  apuradoEm?: string;
};

const DIAS_PERMANENCIA = 7;

export default function AdminGanhadores() {
  const [ganhadores, setGanhadores] = useState<Ganhador[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function loadGanhadores() {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.get(
        "https://zlpix-premiado-fullstack.onrender.com/api/admin/ganhadores",
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data?.ok) {
        setGanhadores(res.data.data || []);
      } else {
        setErro("Resposta inválida do servidor.");
      }
    } catch (e: any) {
      console.error("Erro ganhadores:", e);
      setErro("Erro ao carregar resultado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGanhadores();
  }, []);

  /* ============================
     FILTRO DE PERMANÊNCIA (7 DIAS)
  ============================ */
  function dentroDaPermanencia(g: Ganhador) {
    if (!g.apuradoEm) return false;

    const dataApuracao = new Date(g.apuradoEm);

    const limite = new Date(dataApuracao);
    limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

    return Date.now() <= limite.getTime();
  }

  const ganhadoresVisiveis = ganhadores.filter(dentroDaPermanencia);

  /* ============================
     COPIAR LISTA (COM FALLBACK)
  ============================ */
  async function copiarListaNumerica() {
    const texto = ganhadoresVisiveis
      .map((g) => `${g.id};${g.dezenas}`)
      .join("\n");

    try {
      await navigator.clipboard.writeText(texto);
      alert("Lista copiada com sucesso.");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Lista copiada (modo alternativo).");
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Carregando...</div>;
  }

  if (erro) {
    return <div className="text-sm text-red-600">{erro}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Resultado do Sorteio</h2>

      {/* ===== BLOCO 1 — LISTAGEM VISUAL ===== */}
      <div className="space-y-3">
        {ganhadoresVisiveis.map((g) => (
          <div
            key={g.id}
            className="rounded border bg-gray-50 p-3 text-sm space-y-1"
          >
            <div>
              <strong>Usuário:</strong> #{g.userId} — {g.nome}
            </div>

            <div>
              <strong>Dezenas:</strong> {g.dezenas}
            </div>

            <div>
              <strong>Status:</strong> {g.status}
            </div>

            <div>
              <strong>Prêmio:</strong> R$ {Number(g.premio || 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* ===== BLOCO 2 — LISTAGEM NUMÉRICA ===== */}
      <div className="border-t pt-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Lista Numérica para Conferência Manual
        </h3>

        <button
          onClick={copiarListaNumerica}
          className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
        >
          Copiar lista numérica
        </button>

        <textarea
          readOnly
          value={ganhadoresVisiveis
            .map((g) => `${g.id};${g.dezenas}`)
            .join("\n")}
          className="w-full h-40 mt-2 p-2 text-xs border rounded bg-gray-100"
        />
      </div>
    </div>
  );
}