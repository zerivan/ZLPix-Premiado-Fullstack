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
      if (!token) {
        setStatus("❌ Token admin ausente.");
        return;
      }

      // 🔥 Resultado Federal (teste controlado)
      const premiosFederal = [
        "71900",
        "90310",
        "31071",
        "00000",
        "11111",
      ];

      const res = await axios.post(
        "/api/admin/apuracao/apurar",
        { premiosFederal },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.ok) {
        setStatus("✅ Apuração executada com sucesso.");
      } else {
        setStatus(
          `⚠️ ${res.data?.error || "Resposta inesperada do servidor."}`
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao executar a apuração.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-red-600">
        🎯 Apurar Sorteio (ADMIN)
      </h2>

      <p className="text-sm text-gray-600">
        Esta ação executa a APURAÇÃO REAL:
        <br />• Cruza bilhetes
        <br />• Marca premiados
        <br />• Credita carteiras
      </p>

      <button
        onClick={dispararSorteio}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded font-bold disabled:opacity-60"
      >
        {loading ? "Processando..." : "🔴 DISPARAR APURAÇÃO"}
      </button>

      {status && <div className="text-sm font-semibold">{status}</div>}
    </div>
  );
}