// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bilheteIdParam = params.get("bilheteId");
  const userId = params.get("userId");
  const valorParam = params.get("valor");
  const descricaoParam = params.get("descricao");
  const bilhetesCount = params.get("bilhetesCount");

  const [qrBase64, setQrBase64] = useState("");
  const [copyPaste, setCopyPaste] = useState("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(true);

  const API = "https://zlpix-premiado-fullstack.onrender.com";

  async function gerarPixFromServer(bilheteId?: string) {
    try {
      // se veio bilheteId (antes: pagamento single), deixa como estava
      const body: any = {
        amount: Number(valorParam || 2),
        description: descricaoParam || `Pagamento do bilhete ${bilheteId || ""}`,
      };
      if (bilheteId) body.bilheteId = bilheteId;
      if (userId) body.userId = userId;

      const resposta = await fetch(`${API}/pix/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resposta.json();
      console.log("PIX criado (single):", json);

      if (json.qr_code_base64) {
        const base64Img = `data:image/png;base64,${json.qr_code_base64}`;
        setQrBase64(base64Img);
        setCopyPaste(json.copy_paste);
        setLoading(false);
      } else {
        setStatus("Erro ao gerar QR Code.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Erro ao gerar Pix:", err);
      setStatus("Erro ao gerar PIX.");
      setLoading(false);
    }
  }

  // Se a navegação veio do ApostaPainel (batch), o ApostaPainel já salvou o resultado no localStorage
  function loadFromLocalStorageFallback() {
    try {
      const raw = localStorage.getItem("ZLPX_LAST_PIX");
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed?.qr_code_base64) {
        setQrBase64(`data:image/png;base64,${parsed.qr_code_base64}`);
        setCopyPaste(parsed.copy_paste || "");
        setStatus("Aguardando pagamento...");
        setLoading(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function verificarStatus() {
    // prioritário: se veio bilheteId único
    const checkId = bilheteIdParam;
    if (!checkId) {
      // batch: não temos só um bilheteId — vamos checar transações via mpPaymentId? (não implementado aqui)
      return;
    }

    try {
      const resp = await fetch(`${API}/bilhete/status/${checkId}`);
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
    // 1) se vier bilheteId na query -> pedir ao backend (modo legacy/single)
    if (bilheteIdParam) {
      gerarPixFromServer(bilheteIdParam);
    } else {
      // 2) tenta fallback localStorage (modo batch)
      const ok = loadFromLocalStorageFallback();
      if (!ok) {
        // se nem query nem localstorage -> tenta gerar (modo fallback simples)
        gerarPixFromServer();
      }
    }

    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copiar() {
    navigator.clipboard.writeText(copyPaste || "");
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
          {/* Resumo: se veio via query mostra resumo (valor/descricao/bilhetesCount) */}
          <div className="w-full mb-4 bg-white/10 border border-white/20 rounded-xl p-4 text-sm text-center text-blue-100">
            <p><strong>Bilhete:</strong> {bilheteIdParam ?? (bilhetesCount ? `Pagamento de ${bilhetesCount} bilhetes` : "")}</p>
            <p><strong>Valor a pagar:</strong> R$ {Number(valorParam || (JSON.parse(localStorage.getItem("ZLPX_LAST_PIX") || "{}")?.amount || 0)).toFixed(2)}</p>
            {descricaoParam && (
              <p><strong>Descrição:</strong> {descricaoParam}</p>
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