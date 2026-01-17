// src/pages/pix-carteira.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PixCarteira() {
  const location = useLocation() as any;
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL as string;

  // 🔐 PERSISTE DADOS DO PIX (ANTI-STATE-LOSS)
  const [paymentId] = useState<string>(() => {
    return (
      location.state?.paymentId ||
      sessionStorage.getItem("PIX_CARTEIRA_PAYMENT_ID") ||
      ""
    );
  });

  const [qrCode] = useState<string>(() => {
    return (
      location.state?.qr_code_base64 ||
      sessionStorage.getItem("PIX_CARTEIRA_QR") ||
      ""
    );
  });

  const [copyPaste] = useState<string>(() => {
    return (
      location.state?.copy_paste ||
      sessionStorage.getItem("PIX_CARTEIRA_COPY") ||
      ""
    );
  });

  const [amount] = useState<number>(() => {
    const v =
      location.state?.amount ||
      sessionStorage.getItem("PIX_CARTEIRA_AMOUNT");
    return Number(v || 0);
  });

  const [status, setStatus] = useState("Aguardando pagamento...");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const redirectedRef = useRef(false); // 🔒 EXECUTA UMA VEZ

  // 🔐 SALVA SESSION (BLINDAGEM TOTAL)
  useEffect(() => {
    if (paymentId) {
      sessionStorage.setItem("PIX_CARTEIRA_PAYMENT_ID", paymentId);
      sessionStorage.setItem("PIX_CARTEIRA_QR", qrCode || "");
      sessionStorage.setItem("PIX_CARTEIRA_COPY", copyPaste || "");
      sessionStorage.setItem(
        "PIX_CARTEIRA_AMOUNT",
        String(amount || 0)
      );
    }
  }, [paymentId, qrCode, copyPaste, amount]);

  // 📋 COPIAR PIX
  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(copyPaste);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar o código PIX.");
    }
  }

  // 🔄 POLLING ROBUSTO
  useEffect(() => {
    if (!paymentId) {
      navigate("/carteira", { replace: true });
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await axios.get(
          `${API}/pix/payment-status/${paymentId}`
        );

        const statusPix = String(resp.data?.status || "").toLowerCase();

        if (statusPix === "paid" && !redirectedRef.current) {
          redirectedRef.current = true;

          setStatus("Pagamento confirmado! 🎉");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          // 🧹 LIMPA SESSION DO PIX
          sessionStorage.removeItem("PIX_CARTEIRA_PAYMENT_ID");
          sessionStorage.removeItem("PIX_CARTEIRA_QR");
          sessionStorage.removeItem("PIX_CARTEIRA_COPY");
          sessionStorage.removeItem("PIX_CARTEIRA_AMOUNT");

          // 🔥 REDIRECT GARANTIDO
          setTimeout(() => {
            navigate("/carteira", { replace: true });
          }, 800);
        }
      } catch {
        // erro de rede ignorado
      }
    }, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [paymentId, API, navigate]);

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        💰 Depósito via PIX
      </h1>

      <p className="mb-4 text-sm text-white/80">{status}</p>

      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
        <div className="text-sm text-blue-100">Valor do depósito</div>

        <div className="text-2xl font-extrabold text-yellow-300">
          R$ {amount.toFixed(2)}
        </div>

        {qrCode && (
          <img
            src={`data:image/png;base64,${qrCode}`}
            alt="QR Code PIX"
            className="mx-auto w-56 h-56 rounded-xl bg-white p-2"
          />
        )}

        {copyPaste && (
          <>
            <p className="text-xs break-all bg-black/30 p-3 rounded-xl">
              {copyPaste}
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