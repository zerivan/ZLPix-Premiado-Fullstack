import { useState } from "react";
import axios from "axios";

export default function AdminSorteioControl() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function dispararSorteio() {
    const ok = confirm(
      "⚠️ ATENÇÃO!\n\n" +
        "Esta ação irá:\n" +
        "- Apurar os bilhetes\n" +
        "- Identificar ganhadores\n" +
        "- Distribuir prêmios\n" +
        "- Creditar carteiras\n\n" +
        "Essa ação NÃO PODE ser desfeita.\n\n" +
        "Deseja continuar?"
    );

    if (!ok) return;

    try {
      setLoading(true);
      setStatus(null);

      const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

      const res = await axios.post(
        "/api/admin/sorteio/processar",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 AQUI ESTAVA O ERRO
      // Agora usamos a resposta REAL do backend
      if (res.data?.message) {
        setStatus(
          res.data.status === "NO_DRAW"
            ? `ℹ️ ${res.data.message}`
            : `✅ ${res.data.message}`
        );
      } else {
        setStatus("⚠️ Resposta inesperada do servidor.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao processar o sorteio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-red-600">
        🎯 Processar Sorteio
      </h2>

      <p className="text-sm text-gray-600">
        Esta ação irá executar automaticamente:
        <br />• Apuração dos bilhetes
        <br />• Identificação de ganhadores
        <br />• Divisão do prêmio
        <br />• Crédito nas carteiras
      </p>

      <button
        onClick={dispararSorteio}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
      >
        {loading ? "Processando..." : "🔴 DISPARAR SORTEIO"}
      </button>

      {status && (
        <div className="text-sm font-semibold">
          {status}
        </div>
      )}
    </div>
  );
}