import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function Home() {
  const navigate = useNavigate();

  const [premio, setPremio] = useState<number>(25000);
  const [dataSorteio, setDataSorteio] = useState<string>("04/12/2025");

  // 🔄 Carrega valores salvos (futuro painel admin)
  useEffect(() => {
    const dados = localStorage.getItem("ZLPIX_PREMIO_ATUAL");
    if (dados) {
      const { valor, data } = JSON.parse(dados);
      if (valor) setPremio(valor);
      if (data) setDataSorteio(data);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-between pt-10 pb-24 font-display relative overflow-hidden">
      {/* 🌈 Fundo animado */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400/30 to-yellow-200/10 blur-3xl animate-pulse-slow"></div>

      {/* Conteúdo */}
      <main className="z-10 flex flex-col items-center text-center w-full px-5">
        {/* 🏆 Cabeçalho */}
        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg mb-2 tracking-wide">
          ZLPix Premiado 💰
        </h1>
        <p className="text-blue-100 text-sm mb-8">
          Concorra toda <span className="text-yellow-300 font-semibold">quarta-feira</span> com a Loteria Federal 🎯
        </p>

        {/* 💵 Painel do prêmio */}
        <div className="bg-gradient-to-r from-blue-900 to-green-700 rounded-2xl p-6 w-11/12 text-center shadow-lg border border-green-500/30 mb-8">
          <p className="text-blue-100 text-sm mb-1">🏆 Prêmio acumulado</p>
          <p className="text-4xl font-bold text-yellow-300 mb-3 drop-shadow-md">
            R$ {premio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-blue-200">
            Próximo sorteio:{" "}
            <span className="text-yellow-300 font-semibold">{dataSorteio}</span>
          </p>
        </div>

        {/* 🎯 Botão principal — fora do bloco, com espaçamento */}
        <button
          onClick={() => navigate("/aposta")}
          className="mb-10 bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-blue-900 font-extrabold text-lg px-12 py-4 rounded-full shadow-lg transition-all animate-bounce"
        >
          🎯 FAZER APOSTA AGORA
        </button>

        {/* 📘 Informativo */}
        <div className="bg-blue-900/40 rounded-xl border border-blue-400/30 px-4 py-5 mb-5 max-w-md text-sm text-blue-100 leading-relaxed">
          Você concorre do <span className="text-yellow-300 font-bold">1º ao 5º prêmio</span> da Loteria Federal.
          Se suas dezenas aparecerem em{" "}
          <span className="text-green-300 font-bold">qualquer uma das centenas sorteadas</span>, 
          seu bilhete é premiado! 💫
        </div>

        {/* 🔍 Botão informativo */}
        <button
          onClick={() => navigate("/resultado")}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-full mb-6 transition-all shadow-lg"
        >
          Como funciona o jogo 💡
        </button>
      </main>

      {/* 📱 Menu inferior */}
      <div className="w-full fixed bottom-0 left-0 right-0">
        <NavBottom />
      </div>

      {/* 🎨 Animação */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}