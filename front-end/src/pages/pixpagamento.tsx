// src/pages/pixpagamento.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export default function PixPagamento() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paymentId = params.get("paymentId") || params.get("payment_id");

  const [qrBase64, setQrBase64] = useState<string>("");
  const [copyPaste, setCopyPaste] = useState<string>("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const pollingRef = useRef<any>(null);

  // 🔹 Buscar QR + copia/cola
  useEffect(() => {
    if (!paymentId) return;

    api.get(`/pix/payment-info/${paymentId}`).then((res) => {
      setQrBase64(res.data?.qr_code_base64 || "");
      setCopyPaste(res.data?.copy_paste || "");
    });
  }, [paymentId]);

  // 🔹 Polling do pagamento
  useEffect(() => {
    if (!paymentId) return;

    pollingRef.current = setInterval(async () => {
      const res = await api.get(`/pix/payment-status/${paymentId}`);

      if (res.data?.status === "PAID") {
        clearInterval(pollingRef.current);
        setStatus("Pagamento confirmado! 🎉");

        setTimeout(() => {
          navigate("/carteira", { replace: true });
        }, 1200);
      }
    }, 5000);

    return () => clearInterval(pollingRef.current);
  }, [paymentId, navigate]);

  function copiar() {
    if (!copyPaste) return;
    navigator.clipboard.writeText(copyPaste);
    alert("Código PIX copiado!");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        Pagamento PIX
      </h1>

      <p className="mb-3 text-sm">{status}</p>

      {qrBase64 && (
        <img
          src={`data:image/png;base64,${qrBase64}`}
          alt="QR Code PIX"
          className="w-60 h-60 bg-white p-2 rounded-xl"
        />
      )}

      {copyPaste && (
        <>
          <p className="mt-4 text-xs break-all bg-black/30 p-3 rounded-xl">
            {copyPaste}
          </p>

          <button
            onClick={copiar}
            className="mt-4 w-full max-w-md bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl"
          >
            📋 Copiar código PIX
          </button>
        </>
      )}
    </div>
  );
}