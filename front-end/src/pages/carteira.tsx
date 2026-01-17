import React, { useEffect, useState } from "react";
import NavBottom from "../components/navbottom";
import { motion } from "framer-motion";
import { api } from "../api/client";

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
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);

  // === DEPÓSITO ===
  const [mostrarDeposito, setMostrarDeposito] = useState(false);
  const [valorDeposito, setValorDeposito] = useState("");
  const [pixData, setPixData] = useState<any>(null);
  const [loadingDeposito, setLoadingDeposito] = useState(false);

  // === SAQUE ===
  const [mostrarSaque, setMostrarSaque] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [statusSaque, setStatusSaque] = useState<string | null>(null);
  const [loadingSaque, setLoadingSaque] = useState(false);

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

      setTransacoes(res.data || []);
    } catch {
      setTransacoes([]);
    }
  }

  async function solicitarDeposito() {
    try {
      setLoadingDeposito(true);
      setPixData(null);

      const userId = localStorage.getItem("USER_ID");
      if (!userId) return;

      const valor = Number(valorDeposito);
      if (!valor || valor <= 0) return;

      const res = await api.post(
        "/wallet/depositar",
        { valor },
        { headers: { "x-user-id": userId } }
      );

      setPixData(res.data);
      setValorDeposito("");
      await carregarTransacoes();
    } catch {
      alert("Erro ao gerar PIX");
    } finally {
      setLoadingDeposito(false);
    }
  }

  async function solicitarSaque() {
    setLoadingSaque(true);
    setStatusSaque(null);

    try {
      const userId = localStorage.getItem("USER_ID");
      if (!userId) return;

      const valor = Number(valorSaque);
      if (!valor || valor <= 0) {
        setStatusSaque("Valor inválido");
        return;
      }

      if (valor > saldo) {
        setStatusSaque("Saldo insuficiente");
        return;
      }

      await api.post(
        "/wallet/saque",
        { valor, pixKey },
        { headers: { "x-user-id": userId } }
      );

      setStatusSaque("Saque solicitado. Em análise.");
      setValorSaque("");
      setPixKey("");
      setMostrarSaque(false);

      await carregarTransacoes();
      await carregarSaldo();
    } catch {
      setStatusSaque("Erro ao solicitar saque");
    } finally {
      setLoadingSaque(false);
    }
  }

  useEffect(() => {
    carregarSaldo();
    carregarTransacoes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300">💰 Minha Carteira</h1>
        <p className="text-blue-100 text-sm mt-1">
          Deposite, saque e acompanhe seu saldo
        </p>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-8 max-w-md mx-auto w-full">
        <div className="bg-white/10 p-6 rounded-3xl border border-yellow-300/20 text-center">
          <p className="text-blue-100 text-sm">Saldo disponível</p>
          <h2 className="text-5xl font-extrabold text-yellow-300 mt-2">
            {loading ? "R$ --,--" : `R$ ${saldo.toFixed(2)}`}
          </h2>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg"
          onClick={() => setMostrarDeposito(!mostrarDeposito)}
        >
          ➕ ADICIONAR CRÉDITOS
        </motion.button>

        {mostrarDeposito && (
          <div className="bg-black/60 p-5 rounded-2xl space-y-3">
            <input
              type="number"
              placeholder="Valor do depósito"
              value={valorDeposito}
              onChange={(e) => setValorDeposito(e.target.value)}
              className="w-full p-3 rounded text-black"
            />

            <button
              className="w-full py-3 bg-green-400 text-blue-900 font-bold rounded"
              onClick={solicitarDeposito}
              disabled={loadingDeposito}
            >
              Gerar PIX
            </button>

            {pixData?.copy_paste && (
              <textarea
                readOnly
                value={pixData.copy_paste}
                className="w-full p-2 rounded text-xs text-black"
              />
            )}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-extrabold text-lg"
          onClick={() => setMostrarSaque(!mostrarSaque)}
        >
          💸 SACAR CRÉDITOS
        </motion.button>

        {mostrarSaque && (
          <div className="bg-black/60 p-5 rounded-2xl space-y-3">
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

            {statusSaque && (
              <p className="text-sm text-yellow-200">{statusSaque}</p>
            )}

            <button
              className="w-full py-3 bg-yellow-400 text-blue-900 font-bold rounded"
              onClick={solicitarSaque}
              disabled={loadingSaque}
            >
              Confirmar Saque
            </button>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-yellow-300">
            📜 Histórico
          </h3>

          {transacoes.map((t) => (
            <div key={t.id} className="bg-white/10 p-3 rounded-xl text-sm">
              <div className="flex justify-between font-bold">
                <span>
                  {t.metadata?.tipo === "saque" ? "💸 Saque" : "➕ Depósito"}
                </span>
                <span className="text-yellow-300">
                  R$ {Number(t.valor).toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-blue-100">
                {formatarDataHora(t.createdAt)}
              </div>
              <div className="text-xs text-blue-200">
                Status: {traduzirStatus(t.status)}
              </div>
            </div>
          ))}
        </div>
      </main>

      <NavBottom />
    </div>
  );
}