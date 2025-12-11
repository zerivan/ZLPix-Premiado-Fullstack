// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();

  const [qrBase64, setQrBase64] = useState(state?.qr_code_base64 ?? "");
  const [copyPaste, setCopyPaste] = useState(state?.copy_paste ?? "");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(!Boolean(state?.qr_code_base64));

  const API = import.meta.env.VITE_API_URL;

  const userId = state?.userId;
  const bilhetesList: string[] = state?.bilhetes ?? [];
  const paymentId: string | undefined = state?.paymentId;
  const amount: number | undefined = state?.amount;

  useEffect(() => {
    // se não veio qr do backend já, tentamos buscar info via paymentId (opcional)
    if (!qrBase64 && paymentId) {
      (async () => {
        try {
          setLoading(true);
          const resp = await fetch(`${API}/pix/payment-status/${paymentId}`);
          const json = await resp.json();
          if (resp.ok) {
            if (json.qr_code_base64) setQrBase64(json.qr_code_base64);
            if (json.copy_paste) setCopyPaste(json.copy_paste);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      })();
    }
    // start polling bilhetes
    const interval = setInterval(async () => {
      try {
        const resp = await fetch(`${API}/bilhete/listar/${userId}`);
        const j = await resp.json();
        if (j?.bilhetes?.some((b: any) => b.pago === true)) {
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1500);
        }
      } catch (e) {
        // ignore
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  function copiar() {
    try {
      navigator.clipboard.writeText(copyPaste);
      alert("Código Copia e Cola copiado! 📋");
    } catch {
      alert("Copie manualmente.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">💸 Pagamento PIX</h1>

      {loading ? (
        <p className="text-lg animate-pulse">Preparando pagamento...</p>
      ) : (
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
          {/* Resumo notinha */}
          <div className="w-full mb-4 bg-white/10 rounded-xl p-3 text-sm text-left text-blue-100">
            <p className="font-semibold mb-2">Resumo (nota)</p>
            <div className="space-y-2 max-h-36 overflow-auto">
              {bilhetesList.map((b: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    {b.split(",").map((n) => (
                      <span key={n} className="inline-block bg-yellow-400 text-blue-900 px-2 py-1 rounded mr-2 font-bold">
                        {n}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs">R$ 2,00</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-blue-100 mb-3">{status}</p>

          {qrBase64 ? (
            <img src={`data:image/png;base64,${qrBase64}`} alt="QR Code PIX" className="w-60 h-60 mx-auto rounded-lg" />
          ) : (
            <div className="w-60 h-60 mx-auto bg-black/20 rounded-lg flex items-center justify-center">QR Code não disponível</div>
          )}

          <p className="mt-4 text-xs break-all bg-black/30 p-3 rounded-xl">{copyPaste}</p>

          <button onClick={copiar} className="mt-4 w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-xl">
            📋 Copiar código PIX
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-white/70">Após o pagamento, seus bilhetes serão liberados automaticamente.</p>
    </div>
  );
}