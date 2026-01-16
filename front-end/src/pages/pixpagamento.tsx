// src/pages/pixpagamento.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

type Bilhete = {
  dezenas: string;
  valor: number;
};

export default function PixPagamento() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  const API = (import.meta.env.VITE_API_URL as string) || "";

  const bilhetes: Bilhete[] = state?.bilhetes ?? [];
  const amount: number = state?.amount ?? 0;
  const paymentId: string = state?.paymentId ?? "";
  const qr_code_base64: string = state?.qr_code_base64 ?? "";
  const copy_paste: string = state?.copy_paste ?? "";

  const [qrBase64] = useState<string>(qr_code_base64);
  const [copyPaste] = useState<string>(copy_paste);
  const [status, setStatus] = useState<string>("Aguardando pagamento...");
  const [loading] = useState<boolean>(!qr_code_base64);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ======================
  // 📌 Copiar chave PIX
  // ======================
  async function copiar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(copyPaste);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar o código PIX.");
    }
  }

  // ======================
  // 📌 Polling do pagamento (FINAL)
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

          setTimeout(() => {
            navigate("/meus-bilhetes", { replace: true });
          }, 1200);
        }
      } catch {
        // se der erro de rede, não trava a UI
      }
    }, 4000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [paymentId, API, navigate]);

  // ======================
  // 📌 UI
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        Pagamento PIX
      </h1>

      <p className="mb-4 text-sm text-white/80">{status}</p>

      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
        {bilhetes.length > 0 && (
          <div className="bg-black/30 rounded-xl p-4 text-left text-sm">
            <p className="font-bold text-yellow-300 mb-2">
              🎟️ Bilhetes gerados
            </p>
            {bilhetes.map((b, i) => (
              <p key={i}>
                {b.dezenas} — R$ {b.valor.toFixed(2)}
              </p>
            ))}
            <p className="mt-2 font-bold">
              Total: R$ {amount.toFixed(2)}
            </p>
          </div>
        )}

        {loading && <p>Carregando QR Code...</p>}

        {!loading && qrBase64 && (
          <img
            src={`data:image/png;base64,${qrBase64}`}
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
              onClick={copiar}
              className="w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl"
            >
              📋 Copiar código PIX
            </button>
          </>
        )}
      </div>

      <p className="mt-4 text-xs text-white/70">
        Após o pagamento, aguarde a confirmação nesta tela.
      </p>
    </div>
  );
}
