// src/pages/pix-carteira.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PixCarteira() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL as string;

  const paymentId: string = state?.paymentId ?? "";
  const qr_code_base64: string = state?.qr_code_base64 ?? "";
  const copy_paste: string = state?.copy_paste ?? "";
  const amount: number = state?.amount ?? 0;

  const [status, setStatus] = useState("Aguardando pagamento...");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // 🔐 Blindagem: se entrar sem PIX válido, volta pra carteira
  useEffect(() => {
    if (!paymentId) {
      navigate("/carteira", { replace: true });
    }
  }, [paymentId, navigate]);

  // ======================
  // 📋 Copiar PIX
  // ======================
  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(copy_paste);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar o código PIX.");
    }
  }

  // ======================
  // 🔄 Polling do pagamento
  // ======================
  useEffect(() => {
    if (!paymentId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await axios.get(
          `${API}/pix/payment-status/${paymentId}`
        );

        const paymentStatus =
          typeof resp.data?.status === "string"
            ? resp.data.status.toLowerCase()
            : "";

        if (paymentStatus === "paid") {
          setStatus("Pagamento confirmado! 🎉");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          // 🔥 VOLTA AUTOMÁTICA PARA A CARTEIRA
          setTimeout(() => {
            navigate("/carteira", { replace: true });
          }, 1200);
        }
      } catch {
        // erro de rede não trava a UI
      }
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [paymentId, API, navigate]);

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        💰 Depósito via PIX
      </h1>

      <p className="mb-4 text-sm text-white/80">{status}</p>

      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
        <div className="text-sm text-blue-100">
          Valor do depósito
        </div>

        <div className="text-2xl font-extrabold text-yellow-300">
          R$ {amount.toFixed(2)}
        </div>

        {qr_code_base64 && (
          <img
            src={`data:image/png;base64,${qr_code_base64}`}
            alt="QR Code PIX"
            className="mx-auto w-56 h-56 rounded-xl bg-white p-2"
          />
        )}

        {copy_paste && (
          <>
            <p className="text-xs break-all bg-black/30 p-3 rounded-xl">
              {copy_paste}
            </p>

            <button
              onClick={copiarPix}
              className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl"
            >
              📋 Copiar código PIX
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-white/70 text-center">
        Após o pagamento, o saldo será creditado automaticamente
        <br />
        e você será redirecionado para sua carteira.
      </p>
    </div>
  );
}