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

  // ===== SAQUE =====
  const [mostrarSaque, setMostrarSaque] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loadingSaque, setLoadingSaque] = useState(false);
  const [erroSaque, setErroSaque] = useState<string | null>(null);

  // ===== HISTÓRICO =====
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  async function carregarSaldo() {
    try {
      const userId = localStorage.getItem("USER_ID");
      if (!userId) return;

      const res = await api.get("/wallet/saldo", {
        headers: { "x-user-id": userId },
      });

      setSaldo(Number(res.data?.saldo ?? 0));
    } finally {
      setLoading(false);
    }
  }

  async function carregarTransacoes() {
    const userId = localStorage.getItem("USER_ID");
    if (!userId) return;

    const res = await api.get("/wallet/historico", {
      headers: { "x-user-id": userId },
    });

    const lista = res.data || [];

    const hidden = localStorage.getItem("WALLET_HIST_HIDDEN");
    setTransacoes(hidden === "true" ? [] : lista);
  }

  async function solicitarSaque() {
    setErroSaque(null);

    const valor = Number(valorSaque);
    if (!valor || valor <= 0) {
      setErroSaque("Valor inválido");
      return;
    }

    if (valor > saldo) {
      setErroSaque("Saldo insuficiente");
      return;
    }

    const userId = localStorage.getItem("USER_ID");
    if (!userId) {
      setErroSaque("Usuário não identificado");
      return;
    }

    try {
      setLoadingSaque(true);

      await api.post(
        "/wallet/saque",
        { valor, pixKey },
        { headers: { "x-user-id": userId } }
      );

      setMostrarSaque(false);
      setValorSaque("");
      setPixKey("");

      await carregarSaldo();
      await carregarTransacoes();
    } catch (err: any) {
      setErroSaque(
        err?.response?.data?.error || "Erro ao solicitar saque"
      );
    } finally {
      setLoadingSaque(false);
    }
  }

  function limparHistorico() {
    localStorage.setItem("WALLET_HIST_HIDDEN", "true");
    setTransacoes([]);
  }

  useEffect(() => {
    carregarSaldo();
    carregarTransacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10">
        <h1 className="text-2xl font-extrabold text-yellow-300">
          💰 Minha Carteira
        </h1>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-6">
        <div className="bg-white/10 p-6 rounded-3xl text-center">
          <p className="text-sm">Saldo disponível</p>
          <h2 className="text-4xl font-extrabold text-yellow-300">
            {loading ? "R$ --,--" : `R$ ${saldo.toFixed(2)}`}
          </h2>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-2xl bg-green-400 text-blue-900 font-bold"
          onClick={() => navigate("/add-creditos")}
        >
          ➕ ADICIONAR CRÉDITOS
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-2xl bg-yellow-400 text-blue-900 font-bold"
          onClick={() => setMostrarSaque(true)}
        >
          💸 SACAR CRÉDITOS
        </motion.button>

        {mostrarSaque && (
          <div className="bg-black/70 p-6 rounded-xl space-y-3">
            <input
              type="number"
              placeholder="Valor do saque"
              value={valorSaque}
              onChange={(e) => setValorSaque(e.target.value)}
              className="w-full p-3 rounded text-black"
            />
            <input
              type="text"
              placeholder="Chave PIX"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full p-3 rounded text-black"
            />

            {erroSaque && (
              <p className="text-sm text-red-300">{erroSaque}</p>
            )}

            <div className="flex gap-2">
              <button
                className="flex-1 py-2 bg-gray-500 rounded"
                onClick={() => setMostrarSaque(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 py-2 bg-yellow-400 text-blue-900 font-bold rounded"
                onClick={solicitarSaque}
                disabled={loadingSaque}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-yellow-300">
          📜 Histórico
        </h3>

        <button
          onClick={limparHistorico}
          className="w-full py-2 bg-red-500/70 rounded"
        >
          🧹 Limpar histórico
        </button>

        {transacoes.map((t) => (
          <div key={t.id} className="bg-white/10 p-3 rounded">
            <div className="flex justify-between font-bold">
              <span>
                {t.metadata?.tipo === "saque" ? "💸 Saque" : "➕ Depósito"}
              </span>
              <span>R$ {Number(t.valor).toFixed(2)}</span>
            </div>
            <div className="text-xs">{formatarDataHora(t.createdAt)}</div>
            <div className="text-xs">
              Status: {traduzirStatus(t.status)}
            </div>
          </div>
        ))}
      </main>

      <NavBottom />
    </div>
  );
}