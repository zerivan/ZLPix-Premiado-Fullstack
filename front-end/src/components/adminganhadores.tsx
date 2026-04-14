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

  function visivel(g: Ganhador) {
    if (!g.apuradoEm) return true;

    const dataApuracao = new Date(g.apuradoEm);
    const limite = new Date(dataApuracao);
    limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

    return Date.now() <= limite.getTime();
  }

  const ganhadoresVisiveis = ganhadores.filter(visivel);

  /* ============================
     AGRUPAMENTO POR USUÁRIO
  ============================ */
  const agrupado = ganhadoresVisiveis.reduce((acc, g) => {
    if (!acc[g.userId]) acc[g.userId] = [];
    acc[g.userId].push(g);
    return acc;
  }, {} as Record<number, Ganhador[]>);

  /* ============================
     DOWNLOAD MOTOR (CORRIGIDO)
  ============================ */
  function baixarAtivosMotor() {
    const ativos = ganhadores
      .filter((g) => !g.apuradoEm)
      .slice()
      .reverse();

    if (!ativos.length) {
      alert("Nenhum bilhete ativo para exportar.");
      return;
    }

    // 🔥 CORREÇÃO: usar ID REAL do bilhete
    const linhas = ativos.map(
      (g) => `${g.id};${g.dezenas}`
    );

    const conteudo = linhas.join("\n");

    const blob = new Blob([conteudo], {
      type: "text/plain;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `bilhetes-motor-${Date.now()}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

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

      <div className="space-y-3">
        {Object.entries(agrupado).map(([userId, lista]) => (
          <details
            key={userId}
            className="border rounded bg-gray-50"
          >
            <summary className="cursor-pointer px-3 py-2 font-semibold text-sm">
              👤 #{userId} — {lista[0].nome} ({lista.length} bilhetes)
            </summary>

            <div className="p-2 space-y-1">
              {lista.map((g) => (
                <div
                  key={g.id}
                  className="flex justify-between text-xs border rounded px-2 py-1 bg-white"
                >
                  <span>{g.dezenas}</span>

                  <span
                    className={`font-bold ${
                      !g.apuradoEm
                        ? "text-yellow-600"
                        : g.premio > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {!g.apuradoEm
                      ? "ATIVO"
                      : g.premio > 0
                      ? "GANHOU"
                      : "PERDEU"}
                  </span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Lista Numérica para Conferência Manual
        </h3>

        <div className="flex gap-2">
          <button
            onClick={copiarListaNumerica}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
          >
            Copiar lista numérica
          </button>

          <button
            onClick={baixarAtivosMotor}
            className="px-3 py-1 bg-yellow-600 text-white text-xs rounded"
          >
            Baixar ativos (motor)
          </button>
        </div>

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