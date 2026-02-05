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

  const [mostrarSaque, setMostrarSaque] = useState(false);
  const [valorSaque, setValorSaque] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loadingSaque, setLoadingSaque] = useState(false);
  const [erroSaque, setErroSaque] = useState<string | null>(null);

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

    const lista: Transacao[] = res.data || [];

    const limite = Date.now() - 15 * 24 * 60 * 60 * 1000;

    const filtradas = lista.filter(
      (t) => new Date(t.createdAt).getTime() >= limite
    );

    setTransacoes(filtradas);
  }

  // 🔥 ALTERAÇÃO AQUI — agora gera PDF
  function baixarHistorico() {
    if (transacoes.length === 0) {
      alert("Nenhuma transação para download");
      return;
    }

    const conteudo = transacoes
      .map((t) => {
        return `
          <div style="margin-bottom:15px;">
            <strong>${t.metadata?.tipo === "saque" ? "Saque" : "Depósito"}</strong><br/>
            Valor: R$ ${Number(t.valor).toFixed(2)}<br/>
            Status: ${traduzirStatus(t.status)}<br/>
            Data: ${formatarDataHora(t.createdAt)}
          </div>
        `;
      })
      .join("");

    const janela = window.open("", "", "width=800,height=600");
    if (!janela) return;

    janela.document.write(`
      <html>
        <head>
          <title>Histórico da Carteira</title>
        </head>
        <body style="font-family: Arial; padding:20px;">
          <h2>ZLPIX PREMIADO - Histórico da Carteira (15 dias)</h2>
          ${conteudo}
        </body>
      </html>
    `);

    janela.document.close();
    janela.print();
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

      <main className="flex-1 w-full max-w-xl mx-auto px-6 pt-8 space-y-6">
        <div className="bg-white/10 p-6 rounded-3xl text-center">
          <p className="text-sm">Saldo disponível</p>
          <h2 className="text-4xl font-extrabold text-yellow-300">
            {loading ? "R$ --,--" : `R$ ${saldo.toFixed(2)}`}
          </h2>

          <p className="text-xs text-yellow-300/90 mt-3">
            ⚠️ O valor exibido na carteira refere-se ao resultado automático do sistema.
            O pagamento do prêmio será realizado somente após conferência administrativa do bilhete.
          </p>
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
          📜 Histórico (últimos 15 dias)
        </h3>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={baixarHistorico}
          className="w-full py-2 rounded bg-blue-500/80 font-bold"
        >
          📥 Download do histórico (PDF)
        </motion.button>

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