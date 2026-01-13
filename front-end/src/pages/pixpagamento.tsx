// src/pages/pixpagamento.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import NavBottom from "../components/navbottom";

export default function PixPagamento() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  const paymentId = state?.payment_id;
  const qrBase64 = state?.qr_code_base64;
  const copyPaste = state?.copy_paste;

  const [status, setStatus] = useState("Aguardando pagamento...");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ======================
  // 📋 Copiar código PIX
  // ======================
  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(copyPaste);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar o código.");
    }
  }

  // ======================
  // 🔁 Polling pagamento
  // ======================
  useEffect(() => {
    if (!paymentId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/pix/payment-status/${paymentId}`);
        if (res.data?.status === "PAID") {
          setStatus("Pagamento confirmado 🎉");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          // vai direto pra carteira
          setTimeout(() => {
            navigate("/carteira", { replace: true });
          }, 1200);
        }
      } catch {}
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300">
          Pague com PIX
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          {status}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-6 text-center">
        {qrBase64 && (
          <img
            src={`data:image/png;base64,${qrBase64}`}
            alt="QR Code PIX"
            className="w-64 h-64 bg-white p-3 rounded-2xl shadow-xl"
          />
        )}

        {copyPaste && (
          <>
            <div className="bg-black/30 text-xs break-all p-4 rounded-xl w-full max-w-md">
              {copyPaste}
            </div>

            <button
              onClick={copiarPix}
              className="w-full max-w-md py-3 rounded-xl bg-yellow-400 text-blue-900 font-extrabold shadow-lg"
            >
              📋 COPIAR CÓDIGO PIX
            </button>
          </>
        )}

        <p className="text-xs text-blue-100 mt-2">
          Após o pagamento, o saldo será creditado automaticamente.
        </p>
      </main>

      <NavBottom />
    </div>
  );
}