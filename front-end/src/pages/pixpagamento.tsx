// src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PixPagamento() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bilheteId = params.get("bilheteId");
  const userId = params.get("userId");
  const valorParam = params.get("valor");
  const descricaoParam = params.get("descricao");
  const bilhetesParam = params.get("bilhetes"); // pode ser JSON (array) ou null

  // estado UI
  const [qrBase64, setQrBase64] = useState("");
  const [copyPaste, setCopyPaste] = useState("");
  const [status, setStatus] = useState("Aguardando pagamento...");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const API =
    (import.meta.env.VITE_API_URL as string) ||
    "https://zlpix-premiado-fullstack.onrender.com";

  // normaliza valores
  const valor = valorParam ? Number(valorParam) : 0;
  const descricao = descricaoParam || (bilheteId ? `Pagamento do bilhete ${bilheteId}` : "Pagamento");

  // parse dos bilhetes (suporta JSON stringified de um array ou single bilheteId)
  let bilhetesList: string[] = [];
  try {
    if (bilhetesParam) {
      // já vem como JSON stringified (ex: "[\"id1\",\"id2\"]")
      bilhetesList = JSON.parse(bilhetesParam);
      if (!Array.isArray(bilhetesList)) bilhetesList = [];
    } else if (bilheteId) {
      bilhetesList = [bilheteId];
    }
  } catch (e) {
    console.warn("Erro ao parsear bilhetes query:", e);
    bilhetesList = bilheteId ? [bilheteId] : [];
  }

  // monta discriminação simples para mostrar na UI
  // se for apenas ids, não temos dezenas/discriminação detalhada aqui — vai mostrar IDs.
  // ideal: passar também uma carga com dezenas+valor mas mantemos simples.
  const total = valor; // já deve ser o total enviado na query

  // função que chama o backend dependendo se é lote ou single
  async function gerarPix() {
    setLoading(true);
    setErrorMsg(null);
    setStatus("Gerando pagamento...");

    try {
      // Decide rota: lote quando veio array com >1 ids (ou explicitamente veio 'bilhetes' param)
      const isLote = bilhetesParam && bilhetesList.length > 0;

      if (isLote) {
        // chamar /pix/create-lote
        const body = {
          bilhetes: bilhetesList,
          userId,
          amount: total,
          description: descricao,
        };

        const resp = await fetch(`${API}/pix/create-lote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await resp.json();

        if (!resp.ok) {
          throw new Error(json?.error || json?.details || JSON.stringify(json));
        }

        // monta imagem base64 e copy paste
        if (json.qr_code_base64) {
          setQrBase64(`data:image/png;base64,${json.qr_code_base64}`);
          setCopyPaste(json.copy_paste || "");
          setStatus("QR Code gerado. Aguardando pagamento...");
        } else {
          throw new Error("Resposta do servidor não retornou qr_code_base64.");
        }
      } else {
        // fallback single -> /pix/create (compat)
        const body: any = {
          amount: total || 2.0,
          description: descricao,
        };
        if (bilhetesList.length === 1) body.bilheteId = bilhetesList[0];
        if (userId) body.userId = userId;

        const resp = await fetch(`${API}/pix/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await resp.json();

        if (!resp.ok) {
          throw new Error(json?.error || json?.details || JSON.stringify(json));
        }

        if (json.qr_code_base64) {
          setQrBase64(`data:image/png;base64,${json.qr_code_base64}`);
          setCopyPaste(json.copy_paste || "");
          setStatus("QR Code gerado. Aguardando pagamento...");
        } else {
          throw new Error("Resposta do servidor não retornou qr_code_base64.");
        }
      }
    } catch (err: any) {
      console.error("Erro ao gerar PIX:", err);
      setErrorMsg(typeof err === "string" ? err : err?.message || "Erro desconhecido");
      setStatus("Erro ao gerar PIX.");
    } finally {
      setLoading(false);
    }
  }

  // verifica status do(s) bilhete(s)
  async function verificarStatus() {
    try {
      // se for lote, verifica todos os bilhetes — confirma quando TODOS pagos (ou quando qualquer um, dependendo da regra).
      if (bilhetesList.length > 1) {
        // checa cada bilhete; considera pago se transacao ligada indicar pago.
        const checks = await Promise.all(
          bilhetesList.map(async (id) => {
            const resp = await fetch(`${API}/bilhete/status/${id}`);
            if (!resp.ok) return false;
            const json = await resp.json();
            return !!json.pago;
          })
        );
        const todosPagos = checks.every(Boolean);
        if (todosPagos) {
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1500);
        }
      } else if (bilhetesList.length === 1) {
        const id = bilhetesList[0];
        const resp = await fetch(`${API}/bilhete/status/${id}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (json.pago === true) {
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1500);
        }
      }
    } catch (err) {
      console.log("Erro ao verificar status:", err);
    }
  }

  useEffect(() => {
    gerarPix();
    const interval = setInterval(verificarStatus, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copiar() {
    if (!copyPaste) return alert("Nada para copiar.");
    try {
      navigator.clipboard.writeText(copyPaste);
      alert("Código Copia e Cola copiado! 📋");
    } catch {
      alert("Não foi possível copiar automaticamente. Segure e copie manualmente.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-center p-6 font-display">
      <h1 className="text-2xl font-extrabold text-yellow-300 mb-4 drop-shadow">💸 Pagamento PIX</h1>

      {loading ? (
        <p className="text-lg animate-pulse">Gerando QR Code...</p>
      ) : errorMsg ? (
        <div className="w-full max-w-md bg-red-600/20 border border-red-600 rounded-2xl p-6 text-center">
          <p className="text-red-200 font-semibold mb-2">Erro ao gerar PIX</p>
          <p className="text-xs text-red-100 break-words">{String(errorMsg)}</p>
          <button
            onClick={() => { setErrorMsg(null); setLoading(true); gerarPix(); }}
            className="mt-4 px-4 py-2 bg-yellow-400 text-blue-900 rounded-xl font-bold"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-lg shadow-xl">
          {/* resumo discriminado */}
          <div className="w-full mb-4 bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-left text-blue-100">
            <p className="font-semibold mb-2">Resumo da compra</p>
            {bilhetesList.length > 0 ? (
              <>
                <div className="space-y-2 max-h-36 overflow-auto mb-2">
                  {bilhetesList.map((b, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span>Bilhete {b}</span>
                      <span>R$ {(valor / (bilhetesList.length || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {Number(total).toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-xs">Nenhum bilhete identificado.</p>
            )}
            {userId && <p className="mt-2 text-xs text-blue-200">Cliente: {userId}</p>}
          </div>

          <p className="text-sm text-blue-100 mb-3">{status}</p>

          {qrBase64 ? (
            <img src={qrBase64} alt="QR Code PIX" className="w-60 h-60 mx-auto rounded-lg shadow-lg border border-yellow-300 object-contain" />
          ) : (
            <div className="w-60 h-60 mx-auto bg-black/20 border border-yellow-300 rounded-lg flex items-center justify-center text-xs text-yellow-200">
              QR Code não disponível
            </div>
          )}

          <p className="mt-4 text-xs break-all bg-black/30 p-3 rounded-xl border border-white/10">{copyPaste}</p>

          <button onClick={copiar} className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 rounded-xl shadow-lg active:scale-95">📋 Copiar código PIX</button>
        </div>
      )}

      <p className="mt-4 text-xs text-white/70">Após o pagamento, seus bilhetes serão liberados automaticamente.</p>
    </div>
  );
}