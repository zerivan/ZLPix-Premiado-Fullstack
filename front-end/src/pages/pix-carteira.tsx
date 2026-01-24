import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function PixCarteira() {
const location = useLocation() as any;
const navigate = useNavigate();

const API = (import.meta.env.VITE_API_URL as string) || "https://zlpix-premiado-fullstack.onrender.com";

// Recebe via navigate(state)
const [paymentId] = useState<string>(() => {
return (
location.state?.paymentId ||
sessionStorage.getItem("PIX_CARTEIRA_PAYMENT_ID") ||
""
);
});

const [qrCode] = useState<string>(() => {
return (
location.state?.qr_code_base64 ||
sessionStorage.getItem("PIX_CARTEIRA_QR") ||
""
);
});

const [copyPaste] = useState<string>(() => {
return (
location.state?.copy_paste ||
sessionStorage.getItem("PIX_CARTEIRA_COPY") ||
""
);
});

const [valor] = useState<number>(() => {
return location.state?.amount ?? Number(sessionStorage.getItem("PIX_CARTEIRA_AMOUNT") || 0);
});

const [statusText, setStatusText] = useState<string>("Aguardando pagamento...");
const pollingRef = useRef<number | null>(null);
const redirectedRef = useRef(false);

// Persistência mínima
useEffect(() => {
if (paymentId) {
sessionStorage.setItem("PIX_CARTEIRA_PAYMENT_ID", paymentId);
sessionStorage.setItem("PIX_CARTEIRA_QR", qrCode || "");
sessionStorage.setItem("PIX_CARTEIRA_COPY", copyPaste || "");
sessionStorage.setItem("PIX_CARTEIRA_AMOUNT", String(valor || 0));
}
}, [paymentId, qrCode, copyPaste, valor]);

async function copiarPix() {
try {
await navigator.clipboard.writeText(copyPaste);
alert("Código PIX copiado!");
} catch {
alert("Não foi possível copiar o código PIX.");
}
}

useEffect(() => {
if (!paymentId) {
navigate("/carteira", { replace: true });
return;
}

const poll = async () => {  
  try {  
    const resp = await axios.get(`${API}/wallet/payment-status/${paymentId}`);  
    const s = String(resp.data?.status || "").toLowerCase();  

    if (s === "paid") {  
      setStatusText("Pagamento confirmado! 🎉");  
      if (pollingRef.current) {  
        window.clearInterval(pollingRef.current);  
        pollingRef.current = null;  
      }  

      // limpar sessão do PIX carteira  
      sessionStorage.removeItem("PIX_CARTEIRA_PAYMENT_ID");  
      sessionStorage.removeItem("PIX_CARTEIRA_QR");  
      sessionStorage.removeItem("PIX_CARTEIRA_COPY");  
      sessionStorage.removeItem("PIX_CARTEIRA_AMOUNT");  

      if (!redirectedRef.current) {  
        redirectedRef.current = true;  
        setTimeout(() => {  
          navigate("/carteira", { replace: true });  
        }, 800);  
      }  
    } else {  
      setStatusText("Aguardando pagamento...");  
    }  
  } catch {  
    // erro silencioso  
  }  
};  

// primeira checagem imediata + intervalo  
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
<div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col items-center p-6">
<h1 className="text-2xl font-extrabold text-yellow-300 mb-4">Depósito via PIX</h1>

<p className="mb-4 text-sm text-white/80">{statusText}</p>  

  <div className="w-full max-w-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">  
    {qrCode ? (  
      <img  
        src={`data:image/png;base64,${qrCode}`}  
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
        onClick={copiarPix}  
        className="mt-2 bg-blue-600 px-3 py-1 rounded text-white text-sm"  
      >  
        Copiar código  
      </button>  
    </div>  

    <div className="text-sm">  
      <div className="font-semibold text-yellow-300">Valor do depósito</div>  
      <div className="text-lg">R$ {Number(valor).toFixed(2)}</div>  
    </div>  
  </div>  
</div>

);
}