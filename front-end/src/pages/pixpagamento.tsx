// src/pages/add-creditos.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import NavBottom from "../components/navbottom";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function AddCreditos() {
  const navigate = useNavigate();
  const [valor, setValor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const valoresRapidos = [10, 20, 50, 100];

  function selecionarValor(v: number) {
    setValor(v);
  }

  async function gerarPix() {
    if (!valor || valor <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    const userId = localStorage.getItem("USER_ID");
    if (!userId) {
      alert("Usuário não identificado.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ cria transação de DEPÓSITO
      await api.post(
        "/wallet/depositar",
        { valor },
        {
          headers: { "x-user-id": userId },
        }
      );

      // 2️⃣ cria PIX no Mercado Pago
      const pix = await api.post("/pix/create", {
        userId: Number(userId),
        amount: valor,
        bilhetes: ["deposito"], // marcador interno
        description: "Depósito em carteira",
      });

      const paymentId = pix.data?.payment_id;

      if (!paymentId) {
        throw new Error("paymentId não retornado");
      }

      // 3️⃣ navega CORRETAMENTE para a página PIX
      navigate(`/pagamento?paymentId=${paymentId}`);
    } catch (e) {
      console.error("Erro ao gerar PIX:", e);
      alert("Não foi possível gerar o PIX. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow">
          ➕ Adicionar Créditos
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Escolha um valor para depositar
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {valoresRapidos.map((v) => (
            <motion.button
              key={v}
              whileTap={{ scale: 0.93 }}
              onClick={() => selecionarValor(v)}
              className={`py-4 rounded-2xl backdrop-blur-md border text-lg font-bold shadow-md ${
                valor === v
                  ? "bg-yellow-400 text-blue-900 border-yellow-300"
                  : "bg-white/10 text-yellow-300 border-white/20"
              }`}
            >
              R$ {v}
            </motion.button>
          ))}
        </div>

        <div className="w-full max-w-md">
          <label className="text-sm text-blue-100 font-semibold">
            Outro valor
          </label>
          <input
            type="number"
            value={valor ?? ""}
            onChange={(e) => setValor(Number(e.target.value))}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
            placeholder="Digite um valor"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={gerarPix}
          disabled={loading}
          className="w-full max-w-md py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg shadow-xl disabled:opacity-60"
        >
          {loading ? "Gerando PIX..." : "⚡ GERAR PIX"}
        </motion.button>
      </main>

      <NavBottom />
    </div>
  );
}