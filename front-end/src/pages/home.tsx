import React from "react";
import { useNavigate } from "react-router-dom";
import SorteioTimer from "../components/sorteiotimer"; // 👈 tudo minúsculo
import BottomNav from "../components/bottomnav";       // 👈 tudo minúsculo

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-green-600 text-white flex flex-col items-center pt-10 pb-24 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400/30 to-yellow-200/10 blur-2xl animate-pulse-slow"></div>

      <img
        src="/logo.png"
        alt="ZLPix Premiado"
        className="w-28 mb-4 drop-shadow-lg animate-pulse"
      />

      <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg mb-1 tracking-wide">
        ZLPix Premiado
      </h1>
      <p className="text-blue-100 text-sm mb-6">
        Aposte, ganhe e celebre sua sorte 🍀
      </p>

      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-5 w-11/12 text-center mb-6 shadow-lg border border-green-500/30">
        <p className="text-blue-100 text-sm">Seu saldo</p>
        <p className="text-4xl font-bold text-yellow-300 mb-3 drop-shadow-md">
          R$ 12,50
        </p>
        <button
          onClick={() => alert("Função de adicionar saldo em breve!")}
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-2 rounded-full transition-all shadow-md"
        >
          Adicionar
        </button>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-6 w-11/12 shadow-lg border border-green-400/20 text-center mb-6">
        <SorteioTimer />
      </div>

      <button
        onClick={() => navigate("/aposta")}
        className="mt-4 bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-blue-900 font-extrabold text-lg px-10 py-4 rounded-full shadow-lg transition-all animate-bounce"
      >
        FAZER APOSTA AGORA
      </button>

      <div className="w-full fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}