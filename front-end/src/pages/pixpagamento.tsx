// front-end/src/pages/pixpagamento.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PixPagamento() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // API base (consistente com apostapainel)
  const API = (import.meta.env.VITE_API_URL as string) || "";

  // state fallback: first try location.state (if someone navigou com state),
  // caso contrário parsear query params enviados por apostapainel.tsx
  const paramBilhetes = searchParams.get("bilhetes");
  const paramUserId = searchParams.get("userId");
  const paramValor = searchParams.get("valor");
  const paramDescricao = searchParams.get("descricao");

  // normalize bilhetes: pode vir como JSON string de ids ou array em state
  let initialBilhetes: string[] = [];
  if (state?.bilhetes && Array.isArray(state.bilhetes)) {
    initialBilhetes = state.bilhetes;
  } else if (paramBilhetes) {
    try {
      const parsed = JSON.parse(paramBilhetes);
      if (Array.isArray(parsed)) initialBilhetes = parsed;
      else if (typeof parsed === "string") initialBilhetes = [parsed];
    } catch {
      // talvez seja uma string simples separada por vírgula de dezenas/ids
      if (paramBilhetes.includes(",")) {
        initialBilhetes = paramBilhetes.split(",").map((s) => s.trim());
      } else {
        initialBilhetes = [paramBilhetes];
      }
    }
  }

  const userId = state?.userId ?? paramUserId ?? null;
  const amount = state?.amount ?? (paramValor ? Number(paramValor) : undefined);
  const descricao = state?.descricao ?? paramDescricao ?? "";

  const [qrBase64, setQrBase64] = useState<string | null>(state?.qr_code_base64 ?? null);
  const [copyPaste, setCopyPaste] = useState<string>(state?.copy_paste ?? "");
  const [status, setStatus] = useState<string>("Aguardando pagamento...");
  const [loading, setLoading] = useState<boolean>(!Boolean(state?.qr_code_base64));
  const [paymentId, setPaymentId] = useState<string | undefined>(state?.paymentId);

  // função para criar cobrança (se ainda não veio via state)
  async function criarCobrancaSingle() {
    setLoading(true);
    setStatus("Gerando cobrança PIX...");
    try {
      const payload = {
        userId: userId ?? null,
        amount: amount ?? undefined,
        description: descricao || undefined,
        bilhetes: initialBilhetes,
      };

      const resp = await axios.post(`${API}/pix/create`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      const json = resp.data;
      if (!json) throw new Error("Resposta inválida do servidor");

      if (json.payment_id) setPaymentId(json.payment_id);
      if (json.qr_code_base64) setQrBase64(json.qr_code_base64);
      if (json.copy_paste) setCopyPaste(json.copy_paste);

      setStatus("QR Code gerado. Aguardando pagamento...");
    } catch (err: any) {
      console.error("Erro ao criar cobrança:", err);
      setStatus("Erro ao gerar PIX.");
      alert("Erro ao gerar PIX: " + (err?.response?.data?.error || err.message || err));
    } finally {
      setLoading(false);
    }
  }

  // função para checar status do pagamento via paymentId (opcional)
  async function fetchPaymentStatus(pId: string) {
    try {
      const resp = await axios.get(`${API}/pix/payment-status/${pId}`);
      return resp.data;
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    // Se não veio QR ou paymentId via state, temos que criar a cobrança
    if (!qrBase64 && !paymentId) {
      criarCobrancaSingle();
    }

    // polling para verificar se algum bilhete do usuário foi marcado como pago
    const interval = setInterval(async () => {
      try {
        if (!userId) return;
        const resp = await axios.get(`${API}/bilhete/listar/${userId}`);
        const j = resp.data;
        if (j?.bilhetes?.some((b: any) => b.pago === true)) {
          if (!mounted) return;
          setStatus("Pagamento confirmado! 🎉");
          setTimeout(() => navigate("/meus-bilhetes"), 1200);
        }
      } catch (e) {
        // ignorar erros de polling
      }
    }, 5000);

    // se veio paymentId e não veio qr, tentar buscar info do paymentId (uma vez)
    (async () => {
      try {
        if (paymentId && !qrBase64) {
          setLoading(true);
          const info = await fetchPaymentStatus(paymentId);
          if (info?.qr_code_base64) setQrBase64(info.qr_code_base64);
          if (info?.copy_paste) setCopyPaste(info.copy_paste);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              {initialBilhetes.map((b: string, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    {/* se forem ids, provavelmente você vai querer mostrá-los como estão */}
                    {String(b)
                      .split(",")
                      .map((n) => (
                        <span
                          key={n + idx}
                          className="inline-block bg-yellow-400 text-blue-900 px-2 py-1 rounded mr-2 font-bold"
                        >
                          {n}
                        </span>
                      ))}
                  </div>
                  <div className="text-xs">R$ 2,00</div>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold mt-3">
              <span>Total</span>
              <span>R$ {Number(amount ?? 0).toFixed(2)}</span>
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