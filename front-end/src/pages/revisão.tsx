// src/pages/revisao.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type LocationState = {
  bilhetes: string[];
  valorUnitario?: number;
  userId?: string;
};

export default function Revisao() {
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();

  if (!state || !state.bilhetes) {
    navigate("/aposta");
    return null;
  }

  const bilhetes = state.bilhetes || [];
  const valorUnitario = state.valorUnitario ?? 2.0;
  const quantidade = bilhetes.length;
  const total = quantidade * valorUnitario;

  function montarDescricao() {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const linhas = bilhetes.map((b, idx) => {
      const dezenas = b.split(",").map((n) => `(${n})`).join("");
      return `Bilhete #${idx + 1} ${dezenas}`;
    });

    return `Bilhetes:\n${linhas.join("\n")}\n\nQuantidade: ${quantidade}\nValor unitário: R$ ${valorUnitario.toFixed(
      2
    )}\nTotal: R$ ${total.toFixed(2)}\nData: ${data} • ${hora}`;
  }

  async function prosseguir() {
    try {
      const payload = {
        userId: state.userId || null,
        amount: Number(total.toFixed(2)),
        description: montarDescricao(),
        bilhetes,
      };

      const resp = await fetch(import.meta.env.VITE_API_URL + "/pix/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || JSON.stringify(json));

      navigate("/pagamento", {
        state: {
          userId: state.userId,
          paymentId: json.payment_id,
          qr_code_base64: json.qr_code_base64,
          copy_paste: json.copy_paste,
          bilhetes,
          amount: payload.amount,
        },
      });
    } catch (err: any) {
      alert("Erro ao iniciar pagamento: " + (err?.message || err));
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Revisão do pedido</h2>

        <div className="mb-4 border rounded-lg p-3 bg-gray-50 max-h-64 overflow-auto">
          {bilhetes.map((b, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div className="flex items-center">
                {b.split(",").map((n) => (
                  <span key={n} className="inline-block bg-yellow-300 text-blue-900 px-2 py-1 rounded mr-2 font-bold">
                    {n}
                  </span>
                ))}
              </div>
              <div className="text-sm">R$ {valorUnitario.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 text-sm">
          <div className="flex justify-between">
            <span>Quantidade</span>
            <span>{quantidade}</span>
          </div>
          <div className="flex justify-between">
            <span>Valor unitário</span>
            <span>R$ {valorUnitario.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border border-gray-300 bg-white font-medium"
          >
            ← Voltar e editar
          </button>

          <button
            onClick={prosseguir}
            className="flex-1 py-3 rounded-xl bg-yellow-400 text-blue-900 font-bold"
          >
            Prosseguir para pagamento
          </button>
        </div>
      </div>
    </div>
  );
}