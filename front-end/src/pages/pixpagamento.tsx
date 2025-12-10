// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bilheteId = params.get("bilheteId");
  const userId = params.get("userId");
  const valor = params.get("valor");
  const descricao = params.get("descricao");

  const [qrBase64, setQrBase64] = useState("");
  const [copyPaste, setCopyPaste] = useState("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(true);

  const API = "https://zlpix-premiado-fullstack.onrender.com";

  async function gerarPix() {
    try {
      const resposta = await fetch(`${API}/pix/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(valor),
          description: descricao || `Pagamento do bilhete ${bilheteId}`,
        }),
      });

      const json = await resposta.json();
      console.log("PIX criado:", json);

      if (json.qr_code_base64) {
        const base64Img = `data:image/png;base64,${json.qr_code_base64}`;
        setQrBase64(base64Img);
        setCopyPaste(json.copy_paste);
        setLoading(false);
      } else {
        console.error("⚠️ Base64 vazio:", json);
        setStatus("Erro ao gerar QR Code.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao gerar Pix:", err);
      setStatus("Erro ao gerar PIX.");
      setLoading(false);
    }
  }

  async function verificarStatus() {
    if (!bilheteId) return;

    try {
      const resp = await fetch(`${API}/bilhete/status/${bilheteId}`);
      const json = await resp.json();

      if (json.pago === true) {
        setStatus("Pagamento confirmado! 🎉");
        setTimeout(() => navigate("/meus-bilhetes"), 2000);
      }
    } catch (err) {
      console.log("Erro ao verificar status:", err);
    }
  }

  useEffect(() => {
    gerarPix();
    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  function copiar() {
    navigator.clipboard.writeText(copyPaste);
    alert("Código Copia e Cola copiado! 📋");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-center p-6 font-display">

      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4 drop-shadow">
        💸 Pagamento PIX
      </h1>

      {loading ? (
        <p className="text-lg animate-pulse">Gerando QR Code...</p>
      ) : (
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-lg shadow-xl">

          {/* ⭐ NOVO BLOCO: RESUMO DO PAGAMENTO */}
          <div className="w-full mb-4 bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-center text-blue-100">
            <p><strong>Bilhete:</strong> {bilheteId}</p>
            <p><strong>Valor a pagar:</strong> R$ {Number(valor).toFixed(2)}</p>
            {descricao && (
              <p><strong>Descrição:</strong> {descricao}</p>
            )}
          </div>

          <p className="text-sm text-blue-100 mb-3">{status}</p>

          {qrBase64 ? (
            <img
              src={qrBase64}
              alt="QR Code PIX"
              className="w-60 h-60 mx-auto rounded-lg shadow-lg border border-yellow-300 object-contain"
            />
          ) : (
            <div className="w-60 h-60 mx-auto bg-black/20 border border-yellow-300 rounded-lg flex items-center justify-center text-xs text-yellow-200">
              QR Code não disponível
            </div>
          )}

          <p className="mt-4 text-xs break-all bg-black/30 p-3 rounded-xl border border-white/10">
            {copyPaste}
          </p>

          <button
            onClick={copiar}
            className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 rounded-xl shadow-lg active:scale-95"
          >
            📋 Copiar código PIX
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-white/70">
        Após o pagamento, seu bilhete será liberado automaticamente.
      </p>
    </div>
  );
}