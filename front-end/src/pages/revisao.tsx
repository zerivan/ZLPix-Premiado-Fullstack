import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Ticket = {
  id: string;
  nums: string[];
  valor: number;
  createdAt: string;
  pago?: boolean;
};

type LocationState = {
  tickets: Ticket[];
  userId?: string | number;
};

export default function Revisao() {
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();

  if (!state || !state.tickets || state.tickets.length === 0) {
    navigate("/aposta");
    return null;
  }

  function resolveUserId(): number | null {
    try {
      if (state.userId !== undefined && state.userId !== null) {
        const n = Number(state.userId);
        if (!Number.isNaN(n)) return n;
      }

      const direct = localStorage.getItem("USER_ID");
      if (direct) {
        const n = Number(direct);
        if (!Number.isNaN(n)) return n;
      }

      const stored = localStorage.getItem("USER_ZLPIX");
      if (stored) {
        const parsed = JSON.parse(stored);
        const raw =
          parsed?.id ??
          parsed?.userId ??
          parsed?._id ??
          parsed?.user?.id ??
          parsed?.user?.userId;

        const n = Number(raw);
        if (!Number.isNaN(n)) return n;
      }

      return null;
    } catch {
      return null;
    }
  }

  const userId = resolveUserId();
  if (!userId) {
    alert("Erro: usuário não identificado. Faça login novamente.");
    navigate("/login");
    return null;
  }

  const tickets = state.tickets;
  const quantidade = tickets.length;
  const total = tickets.reduce((acc, t) => acc + t.valor, 0);

  async function prosseguir() {
    try {
      const payload = {
        userId,
        amount: Number(total.toFixed(2)),
        description: "Pagamento de bilhetes ZLPix",
        bilhetes: tickets.map((t) => ({
          dezenas: t.nums.join(","),
          valor: t.valor,
        })),
      };

      const resp = await fetch(
        import.meta.env.VITE_API_URL + "/wallet/depositar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, valor: payload.amount }),
        }
      );

      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json?.error || "Erro ao iniciar pagamento");
      }

      // ✅ CORREÇÃO AQUI: paymentId (camelCase)
      navigate("/pagamento", {
        state: {
          userId,
          paymentId: json.paymentId,
          qr_code_base64: json.qr_code_base64,
          copy_paste: json.copy_paste,
          bilhetes: payload.bilhetes,
          amount: payload.amount,
        },
      });
    } catch (err: any) {
      alert("Erro ao iniciar pagamento: " + err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white">
      <div className="w-full max-w-md bg-blue-950/80 border border-blue-800/40 rounded-2xl p-5 shadow-xl">
        <h2 className="text-lg font-extrabold text-yellow-300 text-center mb-4">
          🧾 Revisão do Pedido
        </h2>

        <div className="space-y-3 mb-4 max-h-56 overflow-auto">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-blue-900/60 border border-blue-800/40 rounded-lg px-3 py-2"
            >
              <div className="flex gap-1">
                {t.nums.map((n) => (
                  <span
                    key={n}
                    className="h-7 w-9 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-extrabold text-xs"
                  >
                    {n}
                  </span>
                ))}
              </div>

              <span className="text-sm text-yellow-300 font-bold">
                R$ {t.valor.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-blue-900/60 border border-blue-800/40 rounded-lg p-3 text-sm mb-5">
          <div className="flex justify-between">
            <span>Quantidade</span>
            <span>{quantidade}</span>
          </div>
          <div className="flex justify-between font-extrabold text-yellow-300 mt-2">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl bg-gray-600 hover:bg-gray-500 text-white font-bold"
          >
            ← Voltar
          </button>

          <button
            onClick={prosseguir}
            className="flex-1 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-extrabold shadow-lg"
          >
            Prosseguir
          </button>
        </div>
      </div>
    </div>
  );
}