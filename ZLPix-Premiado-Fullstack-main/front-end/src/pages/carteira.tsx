// src/pages/carteira.tsx
import React from "react";
import NavBottom from "../components/navbottom";
import { motion } from "framer-motion";

export default function Carteira() {
  const saldo = 0; // depois vamos conectar com backend

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">

      {/* Cabeçalho */}
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow">
          💰 Minha Carteira
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Adicione créditos, saque e veja seu saldo
        </p>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8 text-center">

        {/* SALDO */}
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-yellow-300/20 shadow-xl w-full max-w-md">
          <p className="text-blue-100 text-sm">Seu saldo disponível</p>
          <h2 className="text-5xl font-extrabold text-yellow-300 mt-2 drop-shadow">
            R$ {saldo.toFixed(2)}
          </h2>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className="w-full max-w-md space-y-4">

          {/* DEPOSITAR */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg shadow-lg"
            onClick={() => (window.location.href = "/add-creditos")}
          >
            ➕ ADICIONAR CRÉDITOS
          </motion.button>

          {/* SACAR */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-extrabold text-lg shadow-lg"
            onClick={() => (window.location.href = "/saque")}
          >
            💸 SACAR CRÉDITOS
          </motion.button>

        </div>

      </main>

      {/* MENU INFERIOR */}
      <NavBottom />

    </div>
  );
}