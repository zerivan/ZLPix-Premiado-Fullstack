import { useEffect, useState } from "react";
import axios from "axios";
import NavBottom from "../components/navbottom";

export default function ZLP() {
  const [saldo, setSaldo] = useState(0);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [loadingResgatar, setLoadingResgatar] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("USER_ZLPIX") || "{}");
  const userId = user?.id;

  function normalizarSaldo(valor: unknown) {
    const saldoNumerico = Number(valor);
    return Number.isFinite(saldoNumerico) ? saldoNumerico : 0;
  }

  async function carregarSaldo() {
    try {
      const res = await axios.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });
      setSaldo(normalizarSaldo(res.data?.saldo));
    } catch (err) {
      console.error("Erro saldo:", err);
    }
  }

  useEffect(() => {
    if (userId) carregarSaldo();
  }, [userId]);

  async function handleCheckin() {
    if (loadingCheckin) return;

    try {
      setLoadingCheckin(true);

      const res = await axios.post(
        "/zlp/checkin",
        {},
        {
          headers: { "x-user-id": userId },
        }
      );

      // 🔥 SEMPRE atualiza saldo
      setSaldo(normalizarSaldo(res.data?.saldo));

      if (res.data.ok) {
        setMessage(`+${res.data.ganho} ZLP recebido`);
      } else {
        setMessage("Você já arrecadou hoje, volte amanhã para coletar mais 20 ZLP");
      }
    } catch (err) {
      console.error("Erro checkin:", err);
      setMessage("Erro ao coletar");
    } finally {
      setLoadingCheckin(false);
    }
  }

  async function handleResgatar() {
    if (loadingResgatar) return;

    const saldoAtual = normalizarSaldo(saldo);
    if (saldoAtual < 2000) {
      setMessage("Saldo insuficiente");
      return;
    }

    try {
      setLoadingResgatar(true);

      const res = await axios.post(
        "/zlp/resgatar",
        {},
        {
          headers: { "x-user-id": userId },
        }
      );

      if (res.data?.ok === true) {
        await carregarSaldo();
        setMessage(res.data?.message || "Bilhete gerado com sucesso");
      } else {
        setMessage(res.data?.error || res.data?.message || "Erro ao resgatar bilhete");
      }
    } catch (err: any) {
      console.error("Erro resgatar:", err);
      setMessage(
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Erro ao resgatar bilhete"
      );
    } finally {
      setLoadingResgatar(false);
    }
  }

  const saldoAtual = normalizarSaldo(saldo);
  const progresso = Math.min((saldoAtual / 2000) * 100, 100);
  const faltam = Math.max(2000 - saldoAtual, 0);

  return (
    <div className="bg-[#0b1e5b] min-h-screen relative">

      <main className="pt-10 pb-32 px-6 max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-xl">
              monetization_on
            </span>
            <h1 className="text-blue-200 font-bold uppercase tracking-[0.2em] text-xs">
              Suas Moedas ZLP
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
              {saldoAtual}
            </span>
            <span className="text-lg font-bold text-yellow-400/80 uppercase">
              ZLP
            </span>
          </div>
        </div>

        {/* Card */}
        <section className="bg-gradient-to-br from-[#1e40af] to-[#0b1e5b] rounded-2xl p-6 mb-6 relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-xs font-semibold text-blue-100">
                Progresso para 1 bilhete
              </span>

              <span className="text-lg font-black text-white">
                {saldoAtual}{" "}
                <span className="text-[10px] text-blue-200">
                  / 2000 ZLP
                </span>
              </span>
            </div>

            <div className="h-3 w-full bg-blue-950/60 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-green-300 to-green-200 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <p className="mt-4 text-center text-blue-100 text-xs">
              Faltam{" "}
              <span className="text-yellow-400 font-bold">
                {faltam} ZLP
              </span>{" "}
              para 1 bilhete grátis.
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="space-y-4">

          <button
            onClick={handleCheckin}
            disabled={loadingCheckin}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-white text-xl">
              redeem
            </span>

            <span className="text-white font-bold text-sm">
              {loadingCheckin ? "Processando..." : "Coletar moedas"}
            </span>
          </button>

          <div className="flex flex-col gap-1">

            <button
              onClick={handleResgatar}
              disabled={loadingResgatar}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 py-3 rounded-full flex items-center justify-center gap-2 text-sm border border-white/10 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-white text-lg">
                confirmation_number
              </span>

              <span className="text-white font-semibold">
                {loadingResgatar ? "Processando..." : "Resgatar bilhete"}
              </span>
            </button>

            <div className="bg-blue-950/40 rounded-full py-1 text-center">
              <span className="text-[10px] text-blue-200">
                Necessário 2000 ZLP
              </span>
            </div>

          </div>
        </div>

        {message && (
          <div className="mt-4 text-center text-yellow-300 text-xs">
            {message}
          </div>
        )}

        {/* Moedas */}
        <div className="relative w-full h-80 mt-6 overflow-hidden pointer-events-none">
          <img
            src="/assets/moedas-zlp.png"
            className="absolute bottom-0 left-0 w-full h-full object-cover"
            alt="moedas"
          />
        </div>

      </main>

      {/* MENU FIXO */}
      <div className="fixed bottom-0 left-0 w-full z-50">
        <NavBottom />
      </div>

    </div>
  );
}