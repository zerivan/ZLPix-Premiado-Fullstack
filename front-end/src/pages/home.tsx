// src/pages/home.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function Home() {
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const premioAtual = "R$ 25.000,00";
  const dataSorteio = "04/12/2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">

      {/* 🏆 Cabeçalho */}
      <header className="text-center py-7 border-b border-white/10 shadow-md">
        <h1 className="text-3xl font-extrabold text-yellow-300 drop-shadow-lg">
          ZLPIX PREMIADO 💰
        </h1>
        <p className="text-sm text-blue-100 mt-1">
          Concorra toda quarta-feira com a Loteria Federal 🎯
        </p>
      </header>

      {/* 🔥 ÁREA DE CONTEÚDOS (CENTRALIZADA E AGRUPADA) */}
      <main className="flex-1 px-6 pt-6 space-y-8 flex flex-col items-center text-center">

        {/* 💎 CARD DO PRÊMIO */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-yellow-400/30 w-full max-w-md">
          <p className="text-yellow-300 text-sm mb-1">Prêmio acumulado</p>
          <h2 className="text-4xl font-extrabold drop-shadow-sm">
            {premioAtual}
          </h2>
          <p className="text-sm text-blue-100 mt-2">
            Próximo sorteio:{" "}
            <span className="text-yellow-300 font-semibold">{dataSorteio}</span>
          </p>
        </div>

        {/* 🎯 BOTÃO PRINCIPAL PULSANTE (AGORA FUNCIONANDO) */}
        <motion.button
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          whileTap={{ scale: 0.92 }}
          className="bg-gradient-to-r from-yellow-400 to-green-400 text-blue-900 font-extrabold text-lg px-10 py-3 rounded-full shadow-xl w-full max-w-md"
          onClick={() => navigate("/aposta")}
        >
          🎯 FAZER APOSTA AGORA
        </motion.button>

        {/* 📢 INFO RÁPIDA */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-5 text-sm text-white/90 shadow-inner w-full max-w-md leading-relaxed">
          Você concorre do <strong>1º ao 5º prêmio</strong> da Loteria Federal.
          Se suas dezenas aparecerem em
          <strong> qualquer uma das centenas sorteadas</strong>,
          seu bilhete é premiado!
        </div>

        {/* 📘 COMO FUNCIONA */}
        <div className="w-full max-w-md space-y-4">

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 rounded-full shadow-md transition-all"
          >
            {showInfo ? "Fechar explicação" : "Como funciona o jogo 🎯"}
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-lg space-y-4 w-full"
              >
                {/* 🧩 Esquema visual */}
                <pre className="text-xs text-white/90 font-mono bg-black/20 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap w-full">
{`┌──────────────────────────────┬──────────────────────────────┐
│   🏆 RESULTADO OFICIAL       │        🎟️ SEU BILHETE        │
│   (Loteria Federal)          │                              │
├──────────────────────────────┼──────────────────────────────┤
│ 🥇 1º Prêmio →  3️⃣2️⃣4️⃣5️⃣  │                          │
│ 🥈 2º Prêmio →  4️⃣5️⃣6️⃣7️⃣  │                          │
│ 🥉 3º Prêmio →  6️⃣7️⃣8️⃣9️⃣  │                          │
│ 🎖️ 4º Prêmio →  5️⃣6️⃣5️⃣3️⃣  │                          │
│ 🏁 5º Prêmio →  3️⃣3️⃣4️⃣5️⃣  │                          │
│                              │   🔸 (32)                     │
│                              │   🔸 (45)────────────🟩───────│
│                              │   🔸 (98)                     │
└──────────────────────────────┴──────────────────────────────┘`}
                </pre>

                {/* Explicação */}
                <div className="text-sm space-y-2 text-white/90 leading-relaxed">
                  <p>
                    🎯 Você concorre com <strong>3 dezenas</strong> por bilhete.  
                    Se alguma delas aparecer nas <strong>centenas sorteadas</strong>,  
                    seu bilhete é premiado!
                  </p>

                  <p>💰 O prêmio é <strong>fixo por bilhete</strong>.</p>

                  <p>🔁 Se ninguém ganhar, o prêmio <strong>acumula</strong>.</p>

                  <p>
                    📅 Sorteios oficiais toda{" "}
                    <strong>quarta-feira</strong> pela Caixa Econômica Federal.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* 📱 MENU INFERIOR */}
      <NavBottom />
    </div>
  );
}