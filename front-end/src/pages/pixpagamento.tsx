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

  // ======================
  // 📌 Dados vindos da Revisão (apenas informativos)
  // ======================
  const bilhetes: Bilhete[] = state?.bilhetes ?? [];
  const amount: number = state?.amount ?? 0;
  const paymentId: string = state?.paymentId ?? "";
  const qr_code_base64: string = state?.qr_code_base64 ?? "";
  const copy_paste: string = state?.copy_paste ?? "";

  const [qrBase64, setQrBase64] = useState<string>(qr_code_base64);
  const [copyPaste, setCopyPaste] = useState<string>(copy_paste);
  const [status, setStatus] = useState<string>("Aguardando pagamento...");
  const [loading, setLoading] = useState<boolean>(!qr_code_base64);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // ======================
  // 📌 Copiar chave PIX
  // ======================
  function copiar() {
    navigator.clipboard.writeText(copyPaste);
    alert("Código PIX copiado!");
  }

  // ======================
  // 📌 Polling do pagamento (POR paymentId)
  // ======================
  useEffect(() => {
    if (!paymentId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await axios.get(
          `${API}/pix/payment-status/${paymentId}`
        );

        if (resp.data?.status === "PAID") {
          setStatus("Pagamento confirmado! 🎉");

          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }

          // limpa o state e segue o fluxo normal
          setTimeout(() => {
            navigate("/meus-bilhetes", { replace: true });
          }, 1200);
        }
      } catch {
        // erro silencioso de polling
      }
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [paymentId, API, navigate]);

  // ======================
  // 📌 Se não veio QR pelo state, tentar recuperar
  // ======================
  useEffect(() => {
    async function carregar() {
      if (!paymentId) return;
      if (qrBase64) return;

      setLoading(true);
      try {
        const resp = await axios.get(
          `${API}/pix/payment-status/${paymentId}`
        );

        if (resp.data?.qr_code_base64) {
          setQrBase64(resp.data.qr_code_base64);
          setCopyPaste(resp.data.copy_paste);
        }
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [paymentId, qrBase64, API]);

  // ======================
  // 📌 UI PRINCIPAL
  // ======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        Pagamento PIX
      </h1>

      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">

        {/* 🧾 Resumo */}
        <div className="bg-white/10 rounded-xl p-4 text-sm text-left text-blue-100 mb-4">
          <p className="font-semibold mb-2">Resumo da transação</p>

          <div className="space-y-2 max-h-36 overflow-auto">
            {bilhetes.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  {b.dezenas.split(",").map((n) => (
                    <span
                      key={n}
                      className="inline-block bg-yellow-400 text-blue-900 px-2 py-1 rounded mr-2 font-bold"
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <span className="text-xs">
                  R$ {b.valor.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold mt-3">
            <span>Total</span>
            <span>R$ {amount.toFixed(2)}</span>
          </div>
        </div>

        {/* 💬 Status */}
        <p className="text-sm text-blue-100 mb-3">{status}</p>

        {/* 🟦 QR Code */}
        {loading ? (
          <div className="w-60 h-60 mx-auto bg-black/20 rounded-lg animate-pulse flex items-center justify-center">
            Carregando QR...
          </div>
        ) : qrBase64 ? (
          <img
            src={`data:image/png;base64,${qrBase64}`}
            alt="QR Code PIX"
            className="w-60 h-60 mx-auto rounded-lg"
          />
        ) : (
          <div className="w-60 h-60 mx-auto bg-black/20 rounded-lg flex items-center justify-center">
            QR Code indisponível
          </div>
        )}

        {/* 🔗 Copia e cola */}
        <p className="mt-4 text-xs break-all bg-black/30 p-3 rounded-xl">
          {copyPaste}
        </p>

        <button
          onClick={copiar}
          className="mt-4 w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl"
        >
          📋 Copiar código PIX
        </button>
      </div>

      <p className="mt-4 text-xs text-white/70">
        Após o pagamento, aguarde a confirmação nesta tela.
      </p>
    </div>
  );
}