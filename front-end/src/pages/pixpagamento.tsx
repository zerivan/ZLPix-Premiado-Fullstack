// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // parâmetros recebidos da URL
  const bilheteId = params.get("bilheteId");
  const userId = params.get("userId");
  const valorParam = params.get("valor");
  const descricaoParam = params.get("descricao");
  const bilhetesParam = params.get("bilhetes"); // JSON string

  // states da UI
  const [qrBase64, setQrBase64] = useState("");
  const [copyPaste, setCopyPaste] = useState("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // novo: bilhetes completos do backend
  const [bilhetesInfo, setBilhetesInfo] = useState<any[]>([]);

  const API =
    (import.meta.env.VITE_API_URL as string) ||
    "https://zlpix-premiado-fullstack.onrender.com";

  // números normalizados
  const valor = valorParam ? Number(valorParam) : 0;
  const descricao =
    descricaoParam ||
    (bilheteId ? `Pagamento do bilhete ${bilheteId}` : "Pagamento");

  // transforma lista de bilhetes
  let bilhetesList: string[] = [];
  try {
    if (bilhetesParam) {
      bilhetesList = JSON.parse(bilhetesParam);
      if (!Array.isArray(bilhetesList)) bilhetesList = [];
    } else if (bilheteId) {
      bilhetesList = [bilheteId];
    }
  } catch {
    bilhetesList = bilheteId ? [bilheteId] : [];
  }

  // ==========================================================
  // 🔥 1 — CARREGAR INFORMAÇÕES DOS BILHETES
  // ==========================================================
  async function carregarBilhetesDetalhes() {
    if (!bilhetesList.length) return;

    try {
      const resp = await fetch(`${API}/bilhete/info-lote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: bilhetesList }),
      });

      const json = await resp.json();
      if (json.ok) setBilhetesInfo(json.bilhetes);
    } catch (err) {
      console.log("Erro ao carregar detalhes dos bilhetes:", err);
    }
  }

  // ==========================================================
  // 🔥 2 — CRIAR O PIX (single ou lote)
  // ==========================================================
  async function gerarPix() {
    setLoading(true);
    setErrorMsg(null);
    setStatus("Gerando pagamento...");

    try {
      const isLote = bilhetesList.length > 1;

      if (isLote) {
        const body = {
          bilhetes: bilhetesList,
          userId,
          amount: valor,
          description: descricao,
        };

        const resp = await fetch(`${API}/pix/create-lote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await resp.json();
        if (!resp.ok) {
          throw new Error(json?.error || json?.details || "Erro no PIX");
        }

        setQrBase64(`data:image/png;base64,${json.qr_code_base64}`);
        setCopyPaste(json.copy_paste);
        setStatus("Aguardando pagamento...");
      } else {
        const body: any = {
          amount: valor,
          description: descricao,
          bilheteId: bilhetesList[0],
          userId,
        };

        const resp = await fetch(`${API}/pix/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await resp.json();
        if (!resp.ok)
          throw new Error(json?.error || json?.details || "Erro no PIX");

        setQrBase64(`data:image/png;base64,${json.qr_code_base64}`);
        setCopyPaste(json.copy_paste);
        setStatus("Aguardando pagamento...");
      }
    } catch (err: any) {
      console.error("Erro ao gerar PIX:", err);
      setErrorMsg(err?.message || "Erro desconhecido");
      setStatus("Erro ao gerar PIX.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // 🔥 3 — VERIFICAR STATUS DO PAGAMENTO
  // ==========================================================
  async function verificarStatus() {
    try {
      if (bilhetesList.length > 1) {
        const checks = await Promise.all(
          bilhetesList.map(async (id) => {
            const resp = await fetch(`${API}/bilhete/status/${id}`);
            if (!resp.ok) return false;
            const json = await resp.json();
            return !!json.pago;
          })
        );

        if (checks.every(Boolean)) {
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1500);
        }
      } else if (bilhetesList.length === 1) {
        const resp = await fetch(`${API}/bilhete/status/${bilhetesList[0]}`);
        const json = await resp.json();
        if (json?.pago) {
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1500);
        }
      }
    } catch {}
  }

  // ==========================================================
  // 🔥 4 — EXECUTAR AO ABRIR A PÁGINA
  // ==========================================================
  useEffect(() => {
    carregarBilhetesDetalhes();
    gerarPix();

    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  function copiar() {
    navigator.clipboard.writeText(copyPaste);
    alert("Código PIX copiado 📋");
  }

  // ==========================================================
  // 🔥 INTERFACE — TUDO BONITO E ORGANIZADO
  // ==========================================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center p-6">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4 drop-shadow">
        💸 Pagamento PIX
      </h1>

      {loading ? (
        <p className="text-lg animate-pulse">Gerando QR Code...</p>
      ) : errorMsg ? (
        <div className="w-full max-w-md bg-red-600/20 border border-red-600 rounded-2xl p-6 text-center">
          <p className="text-red-200 font-semibold mb-2">Erro ao gerar PIX</p>
          <p className="text-xs">{errorMsg}</p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-yellow-300/20 border border-yellow-300/30 rounded-2xl p-5 shadow-xl">
          {/* QUADRO AMARELO — DISCRIMINAÇÃO */}
          <div className="bg-yellow-300/30 border border-yellow-400 rounded-xl p-3 mb-4 text-blue-900">
            <p className="font-bold mb-2">Resumo da Compra</p>

            {bilhetesInfo.length > 0 ? (
              <>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {bilhetesInfo.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center"
                    >
                      {/* dezenas em bolinhas amarelas */}
                      <div className="flex gap-1">
                        {String(b.dezenas)
                          .split(",")
                          .map((d: string, i: number) => (
                            <span
                              key={i}
                              className="h-6 w-8 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-bold text-[11px] shadow-md"
                            >
                              {d}
                            </span>
                          ))}
                      </div>

                      {/* valor */}
                      <span className="text-xs font-bold">
                        R$ {Number(b.valor).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* total */}
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>R$ {valor.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-sm">Carregando detalhes...</p>
            )}
          </div>

          {/* status */}
          <p className="text-sm mb-3">{status}</p>

          {/* QR CODE */}
          {qrBase64 ? (
            <img
              src={qrBase64}
              alt="QR Code PIX"
              className="w-60 h-60 mx-auto rounded-lg shadow-lg border border-yellow-300"
            />
          ) : (
            <div className="w-60 h-60 bg-black/20 border border-yellow-300 rounded-lg mx-auto flex items-center justify-center text-xs text-yellow-200">
              QR Code não disponível
            </div>
          )}

          {/* copia e cola */}
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