// src/pages/carteira.tsx
import React, { useEffect, useState, useRef } from "react";
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
  const lastSaldoRef = useRef<number | null>(null);

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
      if (!userId) return null;

      const res = await api.get("/wallet/saldo", {
        headers: { "x-user-id": userId },
      });

      const valor = Number(res.data?.saldo ?? 0);
      setSaldo(valor);
      return valor;
    } catch {
      setSaldo(0);
      return null;
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

  async function solicitarSaque() {
    setLoadingSaque(true);
    setStatusSaque(null);

    try {
      const userId = localStorage.getItem("USER_ID");
      if (!userId) {
        setStatusSaque("Usuário não identificado");
        return;
      }

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display flex flex-col pb-24">
      <header className="text-center py-6 border-b border-white/10 shadow-md">
        <h1 className="text-2xl font-extrabold text-yellow-300 drop-shadow">
          💰 Minha Carteira
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          Adicione créditos, saque e veja seu saldo
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-8 space-y-8 text-center">
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-yellow-300/20 shadow-xl w-full max-w-md">
          <p className="text-blue-100 text-sm">Seu saldo disponível</p>
          <h2 className="text-5xl font-extrabold text-yellow-300 mt-2 drop-shadow">
            {loading ? "R$ --,--" : `R$ ${saldo.toFixed(2)}`}
          </h2>
        </div>

        <div className="w-full max-w-md space-y-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-400 to-green-500 text-blue-900 font-extrabold text-lg shadow-lg"
            onClick={() => navigate("/add-creditos")}
          >
            ➕ ADICIONAR CRÉDITOS
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-extrabold text-lg shadow-lg"
            onClick={() => setMostrarSaque(true)}
          >
            💸 SACAR CRÉDITOS
          </motion.button>
        </div>

        {/* 🔽 FORMULÁRIO DE SAQUE — AGORA LOGO ABAIXO DO BOTÃO */}
        {mostrarSaque && (
          <div className="bg-black/60 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-yellow-300">
              Solicitar Saque
            </h3>

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

            <div className="flex gap-3">
              <button
                className="flex-1 py-3 rounded bg-gray-500"
                onClick={() => setMostrarSaque(false)}
              >
                Cancelar
              </button>
              <button
                className="flex-1 py-3 rounded bg-yellow-400 text-blue-900 font-bold"
                disabled={loadingSaque}
                onClick={solicitarSaque}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}

        {/* HISTÓRICO */}
        <div className="w-full max-w-md text-left space-y-3">
          <h3 className="text-lg font-bold text-yellow-300">
            📜 Histórico da Carteira
          </h3>

          {transacoes.length === 0 && (
            <p className="text-sm text-blue-100">
              Nenhuma movimentação ainda.
            </p>
          )}

          {transacoes.map((t) => {
            const isSaque = t.metadata?.tipo === "saque";

            return (
              <div
                key={t.id}
                className="bg-white/10 rounded-xl p-3 text-sm space-y-1"
              >
                <div className="flex justify-between font-bold">
                  <span>
                    {isSaque ? "💸 Saque solicitado" : "➕ Depósito via PIX"}
                  </span>
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