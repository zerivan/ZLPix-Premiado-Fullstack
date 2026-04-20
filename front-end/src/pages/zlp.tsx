import { useEffect, useState } from "react";
import axios from "axios";
import NavBottom from "../components/navbottom";

export default function ZLP() {
  const [saldo, setSaldo] = useState(0);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("USER_ZLPIX") || "{}");
  const userId = user?.id;

  async function carregarSaldo() {
    try {
      const res = await axios.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });
      setSaldo(res.data.saldo);
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

      if (res.data.ok) {
        setSaldo(res.data.saldo);
        setMessage(`+${res.data.ganho} ZLP recebido`);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error("Erro checkin:", err);
      setMessage("Erro ao coletar");
    } finally {
      setLoadingCheckin(false);
    }
  }

  function handleResgatar() {
    if (saldo < 2000) {
      setMessage("Saldo insuficiente");
      return;
    }

    setMessage("Resgate em breve");
  }

  const progresso = Math.min((saldo / 2000) * 100, 100);

  return (
    <div className="bg-[#0b1e5b] min-h-screen relative">

      <main className="pt-12 pb-32 px-6 max-w-lg mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-yellow-400 text-2xl">
              monetization_on
            </span>
            <h1 className="text-blue-200 font-bold uppercase tracking-[0.2em] text-xs">
              Suas Moedas ZLP
            </h1>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-extrabold tracking-tighter text-yellow-300 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
              {saldo}
            </span>
            <span className="text-xl font-bold text-yellow-400/80 tracking-widest uppercase">
              ZLP
            </span>
          </div>
        </div>

        {/* Card */}
        <section className="bg-gradient-to-br from-[#1e40af] to-[#0b1e5b] rounded-2xl p-8 mb-8 relative overflow-hidden shadow-2xl border border-white/10">

          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

          <div className="relative z-10">

            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-semibold text-blue-100">
                Progresso para 1 bilhete
              </span>

              <span className="text-xl font-black text-white">
                {saldo}{" "}
                <span className="text-xs text-blue-200 font-medium">
                  / 2000 ZLP
                </span>
              </span>
            </div>

            <div className="h-4 w-full bg-blue-950/60 rounded-full overflow-hidden relative border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-green-300 to-green-200 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <p className="mt-6 text-center text-blue-100 font-medium text-sm">
              Faltam{" "}
              <span className="text-yellow-400 font-bold">
                {Math.max(2000 - saldo, 0)} ZLP
              </span>{" "}
              para 1 bilhete grátis.
            </p>

          </div>
        </section>

        {/* Actions */}
        <div className="space-y-6">

          <button
            onClick={handleCheckin}
            disabled={loadingCheckin}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 p-5 rounded-full flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_10px_30px_rgba(249,115,22,0.4)] disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-white text-3xl">
              redeem
            </span>

            <span className="text-white font-black uppercase tracking-tight text-lg">
              {loadingCheckin ? "Processando..." : "Coletar moedas do dia"}
            </span>
          </button>

          <div className="flex flex-col gap-2">

            <button
              onClick={handleResgatar}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-full flex items-center justify-center gap-3 opacity-90 active:scale-95 transition-all border border-white/10"
            >
              <span className="material-symbols-outlined text-white text-2xl">
                confirmation_number
              </span>

              <span className="text-white font-bold uppercase tracking-widest text-sm">
                Resgatar Bilhete
              </span>
            </button>

            <div className="bg-blue-950/40 rounded-full py-2 text-center border border-white/10">
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Necessário 2000 ZLP
              </span>
            </div>

          </div>

        </div>

        {message && (
          <div className="mt-6 text-center text-yellow-300 text-sm">
            {message}
          </div>
        )}

        <div className="relative w-full h-32 mt-8 pointer-events-none opacity-70">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5sEA7TENBRAQiZY20z_nSLMA9tIXOPx5a8lgjsKA39-J_BvFHS4GKlH-WDklFkgPzCHP76y2jJsmnkK4zteaFePS2nyJRqAAOseDHWNUkJ80yHjyOLxBxLEFehcW8HWQe8X0XDnRPApAFXbd6z21V9VlbwN67bB74hEupqFtfwziluxMt14rJ0CS_WVeu2jFayCS1OReFsq4xjL56GEhOEnsZG_eaMXj8trG6nnlOzHWeIR1iyngHPfz_bBSjyIwtE4cx-k6c3Qs"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] scale-110 object-contain"
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