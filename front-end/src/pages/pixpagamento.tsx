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

  const API =
    (import.meta.env.VITE_API_URL as string) ||
    "https://zlpix-premiado-fullstack.onrender.com";

  // Recebe via navigate(state)
  const [paymentId] = useState<string>(() => {
    return (
      state?.paymentId ||
      sessionStorage.getItem("PIX_BILHETE_PAYMENT_ID") ||
      ""
    );
  });

  const [qrBase64] = useState<string>(() => {
    return (
      state?.qr_code_base64 ||
      sessionStorage.getItem("PIX_BILHETE_QR") ||
      ""
    );
  });

  const [copyPaste] = useState<string>(() => {
    return (
      state?.copy_paste ||
      sessionStorage.getItem("PIX_BILHETE_COPY") ||
      ""
    );
  });

  const [bilhetes] = useState<Bilhete[]>(() => {
    return (state?.bilhetes as Bilhete[]) || [];
  });

  const [amount] = useState<number>(() => {
    return state?.amount ?? 0;
  });

  const [statusText, setStatusText] = useState<string>("Aguardando pagamento...");
  const pollingRef = useRef<number | null>(null);
  const redirectedRef = useRef(false);

  // Persistência mínima para evitar perda de state no reload
  useEffect(() => {
    if (paymentId) {
      sessionStorage.setItem("PIX_BILHETE_PAYMENT_ID", paymentId);
      sessionStorage.setItem("PIX_BILHETE_QR", qrBase64 || "");
      sessionStorage.setItem("PIX_BILHETE_COPY", copyPaste || "");
    }
  }, [paymentId, qrBase64, copyPaste]);

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(copyPaste);
      alert("Código PIX copiado!");
    } catch {
      alert("Não foi possível copiar o código PIX.");
    }
  }

  useEffect(() => {
    if (!paymentId) {
      alert("Pagamento não iniciado corretamente.");
      navigate("/aposta", { replace: true });
      return;
    }

    const poll = async () => {
      try {
        const res = await axios.get(`${API}/pix/payment-status/${paymentId}`);
        const s = String(res.data?.status || "").toLowerCase();

        if (s === "paid") {
          setStatusText("Pagamento confirmado! 🎉");
          if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          // limpeza de session apenas do fluxo bilhete
          sessionStorage.removeItem("PIX_BILHETE_PAYMENT_ID");
          sessionStorage.removeItem("PIX_BILHETE_QR");
          sessionStorage.removeItem("PIX_BILHETE_COPY");

          if (!redirectedRef.current) {
            redirectedRef.current = true;
            setTimeout(() => {
              navigate("/meus-bilhetes", { replace: true });
            }, 900);
          }
        } else {
          setStatusText("Aguardando pagamento...");
        }
      } catch (err) {
        // erro silencioso (não trava a UI)
      }
    };

    // primeira checagem imediata + intervalo contínuo
    poll();
    pollingRef.current = window.setInterval(poll, 3000);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [paymentId, API, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4">
        Pagamento PIX — Bilhetes
      </h1>

      <p className="mb-4 text-sm text-white/80">{statusText}</p>

      <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
        {/* QR Code */}
        {qrBase64 ? (
          <img
            src={`data:image/png;base64,${qrBase64}`}
            alt="QR Code PIX"
            className="mx-auto w-56 h-56 object-contain bg-white/5 p-2 rounded"
          />
        ) : (
          <div className="w-56 h-56 mx-auto flex items-center justify-center bg-white/5 rounded text-sm">
            QR não disponível
          </div>
        )}

        <div className="text-sm">
          <div className="mb-2 font-semibold text-yellow-300">Copia e cola</div>
          <div className="break-words bg-black/30 p-3 rounded text-xs">
            {copyPaste || "—"}
          </div>
          <button
            onClick={copiarTexto}
            className="mt-2 bg-blue-600 px-3 py-1 rounded text-white text-sm"
          >
            Copiar código
          </button>
        </div>

        <div className="text-left">
          <div className="font-semibold text-yellow-300 mb-2">Bilhetes</div>
          {bilhetes.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {bilhetes.map((b: Bilhete, i: number) => (
                <li
                  key={i}
                  className="bg-black/30 p-2 rounded flex justify-between"
                >
                  <span>{b.dezenas}</span>
                  <span>R$ {Number(b.valor).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-white/60">Nenhum bilhete informado.</div>
          )}
        </div>

        <div className="text-sm">
          <div className="font-semibold text-yellow-300">Valor total</div>
          <div className="text-lg">R$ {Number(amount).toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
