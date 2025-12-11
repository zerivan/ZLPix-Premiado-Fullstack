// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const userId = params.get("userId");
  const valorParam = params.get("valor");
  const bilhetesParam = params.get("bilhetes"); // array JSON de dezenas: ["34,56,78","12,45,67"]
  const descricaoParam = params.get("descricao");

  const [qrBase64, setQrBase64] = useState("");
  const [copyPaste, setCopyPaste] = useState("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API =
    (import.meta.env.VITE_API_URL as string) ||
    "https://zlpix-premiado-fullstack.onrender.com";

  // Normalizar valores
  const valorTotal = valorParam ? Number(valorParam) : 0;

  // Parse da lista de bilhetes
  let bilhetesList: string[] = [];
  try {
    if (bilhetesParam) {
      bilhetesList = JSON.parse(bilhetesParam);
      if (!Array.isArray(bilhetesList)) bilhetesList = [];
    }
  } catch {
    bilhetesList = [];
  }

  // ============================================================
  // 📌 MONTAR DESCRIÇÃO “NOTINHA” PARA O MERCADO PAGO
  // ============================================================
  function montarDescricao() {
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR");
    const hora = agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const linhas = bilhetesList.map((dezenas) => {
      // dezenas vem como "34,56,78"
      const partes = dezenas
        .split(",")
        .map((n) => `(${n})`)
        .join("");
      return partes;
    });

    return `
Bilhetes:
${linhas.join("\n")}

Quantidade: ${bilhetesList.length}
Valor unitário: R$ 2,00
Total: R$ ${valorTotal.toFixed(2)}
Data: ${data} • ${hora}
`.trim();
  }

  const descricaoFinal = descricaoParam || montarDescricao();

  // ============================================================
  // 🔥 GERAR PIX (sempre modo SINGLE — não usa lote!)
  // ============================================================
  async function gerarPix() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const body = {
        amount: valorTotal,
        description: descricaoFinal,
        bilheteId: "1", // qualquer ID fake (não usado no single final)
        userId,
      };

      const resp = await fetch(`${API}/pix/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await resp.json();

      if (!resp.ok) throw new Error(json.error || json.details);

      if (!json.qr_code_base64) {
        throw new Error("Resposta do servidor não trouxe QR Code.");
      }

      setQrBase64(`data:image/png;base64,${json.qr_code_base64}`);
      setCopyPaste(json.copy_paste || "");
      setStatus("QR Code gerado. Aguardando pagamento...");
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao gerar PIX.");
      setStatus("Erro ao gerar PIX.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 🔍 Verificar status → mas como agora é SINGLE PIX único,
  // basta verificar se QUALQUER bilhete do usuário foi liberado.
  // ============================================================
  async function verificarStatus() {
    try {
      // busca bilhetes do user e vê se algum foi pago
      const resp = await fetch(`${API}/bilhete/listar/${userId}`);
      const json = await resp.json();

      if (json?.bilhetes?.some((b: any) => b.pago === true)) {
        setStatus("Pagamento confirmado! 🎉");
        setTimeout(() => navigate("/meus-bilhetes"), 1500);
      }
    } catch {}
  }

  useEffect(() => {
    gerarPix();
    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  // ============================================================
  // 📋 COPIAR PIX COPIA E COLA
  // ============================================================
  function copiar() {
    try {
      navigator.clipboard.writeText(copyPaste);
      alert("Código Copia e Cola copiado! 📋");
    } catch {
      alert("Copie manualmente.");
    }
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-center p-6 font-display">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4 drop-shadow">
        💸 Pagamento PIX
      </h1>

      {/* LOADING */}
      {loading ? (
        <p className="text-lg animate-pulse">Gerando QR Code...</p>
      ) : errorMsg ? (
        <div className="w-full max-w-md bg-red-600/20 border border-red-600 rounded-2xl p-6 text-center">
          <p className="text-red-200 font-semibold mb-3">Erro ao gerar PIX</p>
          <p className="text-xs text-red-100 mb-4">{errorMsg}</p>
          <button
            onClick={() => gerarPix()}
            className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-xl font-bold"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-lg shadow-xl">
          {/* RESUMO DA COMPRA */}
          <div className="w-full mb-4 bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-left text-blue-100">
            <p className="font-semibold mb-2">Resumo da compra</p>

            <div className="space-y-1 max-h-36 overflow-auto mb-2">
              {bilhetesList.map((nums, idx) => {
                const dezenas = nums
                  .split(",")
                  .map((n) => (
                    <span
                      key={n}
                      className="inline-block bg-yellow-400 text-blue-900 font-bold px-2 py-1 rounded-md mx-1"
                    >
                      {n}
                    </span>
                  ));

                return (
                  <div key={idx} className="flex justify-between items-center">
                    <div>{dezenas}</div>
                    <span className="text-xs">R$ 2,00</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between font-bold mt-2">
              <span>Total</span>
              <span>R$ {valorTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* STATUS */}
          <p className="text-sm text-blue-100 mb-3">{status}</p>

          {/* QR CODE */}
          {qrBase64 ? (
            <img
              src={qrBase64}
              alt="QR Code PIX"
              className="w-60 h-60 mx-auto rounded-lg shadow-lg border border-yellow-300 object-contain"
            />
          ) : (
            <div className="w-60 h-60 mx-auto bg-black/20 border border-yellow-300 rounded-lg flex items-center justify-center text-xs">
              QR Code não disponível
            </div>
          )}

          {/* COPIA E COLA */}
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
        Após o pagamento, seus bilhetes serão liberados automaticamente.
      </p>
    </div>
  );
}