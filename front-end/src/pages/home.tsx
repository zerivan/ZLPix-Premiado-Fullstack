import React from "react";
import { useNavigate } from "react-router-dom";
import SorteioTimer from "../components/SorteioTimer";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-green-600 text-white flex flex-col items-center pt-10 pb-24 relative overflow-hidden">

      {/* Brilho de fundo */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400/30 to-yellow-200/10 blur-2xl"></div>

      {/* LOGO */}
      <img
        src="/logo.png"
        alt="ZLPix Premiado"
        className="w-24 mb-4 drop-shadow-md animate-pulse"
      />

      {/* Título */}
      <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg mb-1">
        ZLPix Premiado
      </h1>
      <p className="text-blue-100 text-sm mb-6">
        Acompanhe tudo sobre seus sorteios 🍀
      </p>

      {/* SEU SALDO */}
      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-5 w-11/12 text-center mb-6 shadow-lg border border-green-500/30">
        <p className="text-blue-100 text-sm">Seu saldo</p>
        <p className="text-4xl font-bold text-yellow-300 mb-3 drop-shadow-md">R$ 12,50</p>
        <button
          onClick={() => alert('Função de adicionar saldo em breve!')}
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-6 py-2 rounded-full transition"
        >
          Adicionar
        </button>
      </div>

      {/* TIMER DO SORTEIO */}
      <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-6 w-11/12 shadow-lg border border-green-400/20 text-center">
        <SorteioTimer />
      </div>

      {/* BOTÃO PRINCIPAL */}
      <button
        onClick={() => navigate("/aposta")}
        className="mt-6 bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-blue-900 font-extrabold text-lg px-10 py-4 rounded-full shadow-lg transition-all animate-bounce"
      >
        FAZER APOSTA AGORA
      </button>

      {/* MENU FIXO */}
      <div className="w-full fixed bottom-0 left-0 right-0">
        <BottomNav />
      </div>
    </div>
  );
}