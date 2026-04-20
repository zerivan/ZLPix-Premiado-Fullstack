import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ZLPPage() {
  const [saldo, setSaldo] = useState(0);
  const [lastCheckin, setLastCheckin] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const META = 2000;

  async function carregarSaldo() {
    try {
      const userId = localStorage.getItem("USER_ID");

      const res = await api.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });

      setSaldo(res.data.saldo || 0);
      setLastCheckin(res.data.lastCheckin || null);
    } catch (err) {
      console.error("Erro ao carregar ZLP:", err);
    }
  }

  async function handleCheckin() {
    try {
      setLoading(true);

      const userId = localStorage.getItem("USER_ID");

      const res = await api.post(
        "/zlp/checkin",
        {},
        { headers: { "x-user-id": userId } }
      );

      if (res.data.ok) {
        setSaldo(res.data.saldo);
        setLastCheckin(new Date().toISOString());
      }
    } catch (err) {
      console.error("Erro checkin:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResgatar() {
    try {
      setLoading(true);

      const userId = localStorage.getItem("USER_ID");

      await api.post(
        "/zlp/resgatar",
        {},
        { headers: { "x-user-id": userId } }
      );

      await carregarSaldo();
      alert("Bilhete gerado com sucesso!");
    } catch (err) {
      console.error("Erro resgatar:", err);
      alert("Erro ao resgatar");
    } finally {
      setLoading(false);
    }
  }

  function jaFezCheckinHoje() {
    if (!lastCheckin) return false;

    const hoje = new Date().toDateString();
    const data = new Date(lastCheckin).toDateString();

    return hoje === data;
  }

  useEffect(() => {
    carregarSaldo();
  }, []);

  const progresso = Math.min((saldo / META) * 100, 100);
  const falta = META - saldo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white p-4">

      <div className="max-w-md mx-auto">

        {/* SALDO */}
        <div className="bg-blue-800 rounded-2xl p-6 text-center shadow-lg">
          <h1 className="text-lg mb-2">Suas Moedas ZLP</h1>

          <div className="text-4xl font-bold text-yellow-300">
            {saldo.toLocaleString()} ZLP
          </div>

          {/* BARRA */}
          <div className="mt-4">
            <div className="w-full bg-blue-950 rounded-full h-4 overflow-hidden">
              <div
                className="bg-green-400 h-4 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <p className="text-sm mt-2">
              {saldo} / {META} ZLP
            </p>

            {saldo < META && (
              <p className="text-xs text-blue-200">
                Faltam {falta} ZLP para 1 bilhete
              </p>
            )}
          </div>
        </div>

        {/* CHECK-IN */}
        <div className="mt-6">
          <button
            onClick={handleCheckin}
            disabled={jaFezCheckinHoje() || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${
              jaFezCheckinHoje()
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {jaFezCheckinHoje()
              ? "Já coletado hoje"
              : "Coletar moedas do dia"}
          </button>
        </div>

        {/* RESGATE */}
        <div className="mt-4">
          <button
            onClick={handleResgatar}
            disabled={saldo < META || loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition ${
              saldo >= META
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            {saldo >= META
              ? "Resgatar bilhete"
              : "Necessário 2000 ZLP"}
          </button>
        </div>

      </div>
    </div>
  );
}