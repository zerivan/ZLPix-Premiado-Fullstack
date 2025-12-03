// src/pages/home.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavBottom from "../components/navbottom";

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const premioAtual = "R$ 25.000,00";
  const dataSorteio = "04/12/2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 text-white flex flex-col items-center justify-between pt-10 pb-24 relative overflow-hidden font-display">
      {/* 🌈 Fundo suave animado */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-green-400/20 to-yellow-200/10 blur-3xl animate-pulse-slow"></div>

      {/* Conteúdo principal */}
      <main className="flex flex-col items-center text-center z-10 w-full px-4">
        <img
          src="/logo.png"
          alt="ZLPix Premiado"
          className="w-28 mb-4 drop-shadow-lg animate-pulse"
        />

        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg mb-1 tracking-wide">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-blue-100 text-sm mb-6">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>

        {/* 💎 Valor do prêmio */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-11/12 max-w-md text-center mb-6 shadow-lg border border-yellow-400/30">
          <p className="text-yellow-300 text-sm mb-1">Prêmio acumulado</p>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
            {premioAtual}
          </h2>
          <p className="text-sm text-blue-100 mt-2">
            Próximo sorteio:{" "}
            <span className="text-yellow-300 font-semibold">{dataSorteio}</span>
          </p>
        </div>

        {/* ℹ️ Informativo */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center text-sm text-white/90 shadow-inner mb-4 max-w-md">
          Você concorre do <strong>1º ao 5º prêmio</strong> da Loteria Federal.
          Se suas dezenas aparecerem em{" "}
          <strong>qualquer uma das centenas sorteadas</strong>, seu bilhete é
          premiado!
        </div>

        {/* 💡 Botão “Como funciona o jogo” */}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-11/12 max-w-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold py-3 rounded-full shadow-md transition-all"
        >
          {showInfo ? "Fechar explicação" : "Como funciona o jogo 💡"}
        </button>

        {/* 🧩 Painel explicativo animado */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-lg space-y-4 text-sm text-white/90 w-11/12 max-w-md"
            >
              <pre className="text-xs text-white/90 font-mono bg-black/20 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap">
{`┌──────────────────────────────┬──────────────────────────────┐
│   🏆 RESULTADO OFICIAL       │        🎟️ SEU BILHETE        │
│   (Loteria Federal)          │                              │
├──────────────────────────────┼──────────────────────────────┤
│ 🥇 1º Prêmio →  3️⃣2️⃣4️⃣5️⃣  ←───┐                          │
│ 🥈 2º Prêmio →  4️⃣5️⃣6️⃣7️⃣  ←──┼───┐                      │
│ 🥉 3º Prêmio →  6️⃣7️⃣8️⃣9️⃣      │   │                      │
│ 🎖️ 4º Prêmio →  5️⃣6️⃣5️⃣3️⃣      │   │                      │
│ 🏁 5º Prêmio →  3️⃣3️⃣4️⃣5️⃣  ←──┘   │                      │
│                              │   │                          │
│                              │  🔸 (32)                     │
│                              │  🔸 (45)───────────────🟩────┘
│                              │  🔸 (98)                     │
└──────────────────────────────┴──────────────────────────────┘`}
              </pre>

              <div className="space-y-2">
                <p>
                  🎯 Cada bilhete contém <strong>3 dezenas</strong>.  
                  Se uma delas aparecer nas <strong>centenas sorteadas</strong>
                  da Loteria Federal, o bilhete é premiado!
                </p>
                <p>
                  💰 O prêmio é <strong>fixo por bilhete</strong>. Mesmo que
                  mais de uma dezena acerte, você ganha apenas uma vez.
                </p>
                <p>
                  🔁 Se ninguém acertar, o prêmio{" "}
                  <strong>acumula para o próximo sorteio</strong>.
                </p>
                <p>
                  📅 Sorteios oficiais da{" "}
                  <strong>Caixa Econômica Federal</strong> toda
                  <strong> quarta-feira</strong>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚀 Botão principal */}
        <motion.button
          onClick={() => navigate("/aposta")}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-11/12 max-w-md bg-gradient-to-r from-yellow-400 to-green-500 text-blue-900 font-extrabold text-lg py-4 mt-6 rounded-full shadow-lg hover:scale-[1.03] active:scale-95 transition-transform"
        >
          🎯 FAZER APOSTA AGORA
        </motion.button>
      </main>

      {/* 📱 Menu inferior fixo */}
      <div className="w-full fixed bottom-0 left-0 right-0">
        <NavBottom />
      </div>

      {/* ✨ Animações extras */}
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