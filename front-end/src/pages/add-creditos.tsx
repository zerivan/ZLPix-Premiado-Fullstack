// src/pages/add-creditos.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";

export default function AddCreditos() {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  const valoresRapidos = [10, 20, 50, 100];

  function selecionarValor(v: number) {
    setValor(String(v));
  }

  async function gerarPix() {
    if (!valor || Number(valor) <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/wallet/depositar", {
        valor: Number(valor),
      });

      const redirectUrl = res.data?.redirectUrl;

      if (!redirectUrl) {
        throw new Error("Resposta inválida do servidor");
      }

      window.location.href = redirectUrl;

    } catch (e) {
      console.error("Erro ao gerar PIX:", e);
      alert("Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">

      {/* Cabeçalho */}
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow">
          ➕ Adicionar Créditos
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Escolha um valor para depositar
        </p>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8">

        {/* VALORES RÁPIDOS */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {valoresRapidos.map((v) => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.93 }}
              onClick={() => selecionarValor(v)}
              className="py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-lg font-bold text-yellow-300 shadow-md"
            >
              R$ {v}
            </motion.button>
          ))}
        </div>

        {/* CAMPO MANUAL */}
        <div className="w-full max-w-md">
          <label className="text-sm text-blue-100 font-semibold">
            Outro valor
          </label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Digite um valor"
          />
        </div>

        {/* BOTÃO GERAR PIX */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={gerarPix}
          disabled={loading}
          className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg shadow-xl disabled:opacity-60"
        >
          {loading ? "Gerando PIX..." : "⚡ GERAR PIX"}
        </motion.button>

      </main>

      {/* MENU INFERIOR */}
      <NavBottom />
    </div>
  );
}