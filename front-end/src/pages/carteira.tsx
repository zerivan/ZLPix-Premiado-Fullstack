// src/pages/carteira.tsx
import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import { motion } from "framer-motion";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

type Transacao = {
  id: number;
  valor: number;
  status: string;
  createdAt: string;
  metadata?: {
    tipo?: "deposito" | "saque";
  };
};

function formatarDataHora(data: string) {
  const d = new Date(data);
  return (
    d.toLocaleDateString("pt-BR") +
    " às " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  );
}

function traduzirStatus(status: string) {
  if (status === "pending") return "Em análise";
  if (status === "paid") return "Pago";
  return status;
}

export default function Carteira() {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);

  // === HISTÓRICO ===
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  async function carregarSaldo() {
    try {
      const userId = localStorage.getItem("USER_ID");
      if (!userId) return;

      const res = await api.get("/wallet/saldo", {
        headers: { "x-user-id": userId },
      });

      setSaldo(Number(res.data?.saldo ?? 0));
    } catch {
      setSaldo(0);
    } finally {
      setLoading(false);
    }
  }

  async function carregarTransacoes() {
    try {
      const userId = localStorage.getItem("USER_ID");
      if (!userId) return;

      const res = await api.get("/wallet/historico", {
        headers: { "x-user-id": userId },
      });

      const lista = res.data || [];

      // 🔓 SE EXISTE NOVA TRANSAÇÃO, REATIVA HISTÓRICO
      if (lista.length > 0) {
        localStorage.removeItem("WALLET_HIST_HIDDEN");
      }

      const hidden = localStorage.getItem("WALLET_HIST_HIDDEN");
      setTransacoes(hidden === "true" ? [] : lista);
    } catch {
      setTransacoes([]);
    }
  }

  function baixarHistorico() {
    const API_URL = import.meta.env.VITE_API_URL;
    window.open(`${API_URL}/wallet/historico/download`, "_blank");
  }

  function limparHistorico() {
    if (!transacoes.length) return;

    const ok = confirm(
      "Isso irá ocultar o histórico da carteira.\nO saldo não será alterado.\nDeseja continuar?"
    );

    if (!ok) return;

    localStorage.setItem("WALLET_HIST_HIDDEN", "true");
    setTransacoes([]);
  }

  useEffect(() => {
    carregarSaldo();
    carregarTransacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300">
          💰 Minha Carteira
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Deposite, saque e acompanhe seu saldo
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8">
        <div className="bg-white/10 p-6 rounded-3xl border border-yellow-300/20 shadow-xl w-full max-w-md text-center">
          <p className="text-blue-100 text-sm">Saldo disponível</p>
          <h2 className="text-5xl font-extrabold text-yellow-300 mt-2">
            {loading ? "R$ --,--" : `R$ ${saldo.toFixed(2)}`}
          </h2>
        </div>

        <div className="w-full max-w-md space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-green-400 text-blue-900 font-extrabold"
            onClick={() => navigate("/add-creditos")}
          >
            ➕ ADICIONAR CRÉDITOS
          </motion.button>
        </div>

        {/* HISTÓRICO */}
        <div className="w-full max-w-md space-y-3 text-left">
          <h3 className="text-lg font-bold text-yellow-300">
            📜 Histórico da Carteira
          </h3>

          <div className="flex gap-2">
            <button
              onClick={baixarHistorico}
              className="flex-1 py-2 rounded bg-white/20 text-white text-sm font-semibold"
            >
              ⬇️ Baixar histórico
            </button>

            <button
              onClick={limparHistorico}
              className="flex-1 py-2 rounded bg-red-500/70 text-white text-sm font-semibold"
            >
              🧹 Limpar histórico
            </button>
          </div>

          {transacoes.length === 0 && (
            <p className="text-sm text-blue-100">
              Nenhuma movimentação para exibir.
            </p>
          )}

          {transacoes.map((t) => {
            const isSaque = t.metadata?.tipo === "saque";

            return (
              <div
                key={t.id}
                className="bg-white/10 rounded-xl p-3 text-sm"
              >
                <div className="flex justify-between font-bold">
                  <span>{isSaque ? "💸 Saque" : "➕ Depósito"}</span>
                  <span className="text-yellow-300">
                    R$ {Number(t.valor).toFixed(2)}
                  </span>
                </div>

                <div className="text-blue-100 text-xs">
                  {formatarDataHora(t.createdAt)}
                </div>

                <div className="text-blue-200 text-xs">
                  Status: {traduzirStatus(t.status)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <NavBottom />
    </div>
  );
}