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
          <h1 className="text-lg mb-2">Suas Moedas ZLP