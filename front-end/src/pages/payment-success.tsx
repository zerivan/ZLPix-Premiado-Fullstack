// src/pages/payment-success.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import NavBottom from "../components/navbottom";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  // ⏳ Redireciona automaticamente para home após 4s
  useEffect(() => {
    const timer = setTimeout(() => navigate("/"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Dezenas de exemplo
  const dezenas = ["08", "50", "32"];

  return (
    <div className="min-h-screen bg-[#0b1221] text-white font-display flex flex-col relative overflow-hidden">
      {/* 🌈 Cabeçalho degradê azul-verde */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-green-600 py-4 shadow-md border-b border-green-400/30">
        <h1 className="text-center text-lg font-extrabold text-yellow-300 drop-shadow-sm">
          Pagamento Confirmado 💸
        </h1>
        <p className="text-center text-sm text-blue-100 mt-1">
          Seu bilhete foi gerado com sucesso. Boa sorte! 🍀
        </p>
      </div>

      <main className="flex-1 mx-auto w-full max-w-md px-6 pt-10 pb-32 text-center">
        {/* ✅ Ícone de sucesso */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-green-500/20 mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-600/40 animate-bounce-slow">
              <span className="material-symbols-outlined text-5xl text-white">
                check
              </span>
            </div>
          </div>

          {/* Mensagem */}
          <h1 className="text-3xl font-extrabold text-yellow-300 mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-blue-100 text-sm">
            Seu bilhete foi enviado para seu e-mail e WhatsApp 📲
          </p>
        </div>

        {/* 🎟️ Bilhete */}
        <div className="w-full mt-10 flex justify-center">
          <div className="rounded-xl bg-[#111a2e] shadow-xl p-6 flex flex-col items-center border border-green-400/30 w-full">
            <h2 className="text-sm text-yellow-300 mb-3">
              Suas dezenas sorteadas
            </h2>

            <div className="flex gap-4 mb-3">
              {dezenas.map((d, i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center text-xl font-extrabold shadow-md animate-[pop_0.25s_ease-out]"
                >
                  {d}
                </div>
              ))}
            </div>

            <p className="text-sm text-blue-100">
              Bilhete gerado e confirmado com sucesso ✔
            </p>
          </div>
        </div>

        {/* 🕐 Informação e botão */}
        <p className="text-xs text-gray-400 mt-6">
          Você será redirecionado automaticamente para o início em alguns
          segundos...
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 w-full h-14 rounded-full bg-green-500 hover:bg-green-600 text-white font-extrabold shadow-md transition-all"
        >
          Voltar para o Início Agora
        </button>
      </main>

      <NavBottom />

      {/* 🌟 Animações */}
      <style>{`
        @keyframes pop {
          0%   { transform: scale(0.4); opacity: 0 }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}