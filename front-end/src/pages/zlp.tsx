import { useEffect, useState } from "react";
import { api } from "../api/client";
import NavBottom from "../components/navbottom";

export default function ZLP() {
  const [saldo, setSaldo] = useState(0);
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [loadingResgatar, setLoadingResgatar] = useState(false);
  const [message, setMessage] = useState("");

  function resolveUserId() {
    const userIdFromStorage = localStorage.getItem("USER_ID");
    if (userIdFromStorage) return String(userIdFromStorage);

    const stored = localStorage.getItem("USER_ZLPIX");
    if (!stored) return "";

    try {
      const parsed = JSON.parse(stored);

      if (parsed?.id != null) return String(parsed.id);
      if (parsed?.user?.id != null) return String(parsed.user.id);
      if (parsed?.userId != null) return String(parsed.userId);

      return "";
    } catch {
      return "";
    }
  }

  // 🔥 FIX: userId reativo
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(resolveUserId());
  }, []);

  function normalizarSaldo(valor: unknown) {
    const saldoNumerico = Number(valor);
    return Number.isFinite(saldoNumerico) ? saldoNumerico : 0;
  }

  async function carregarSaldo() {
    if (!userId) return;

    try {
      const res = await api.get("/zlp/saldo", {
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
    if (!userId) {
      setMessage("Usuário não autenticado");
      return;
    }

    try {
      setLoadingCheckin(true);

      const res = await api.post(
        "/zlp/checkin",
        {},
        {
          headers: { "x-user-id": userId },
        }
      );

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
    if (!userId) {
      setMessage("Usuário não autenticado");
      return;
    }

    const saldoAtual = normalizarSaldo(saldo);
    if (saldoAtual < 2000) {
      setMessage("Saldo insuficiente");
      return;
    }

    try {
      setLoadingResgatar(true);

      const res = await api.post(
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

        {/* restante do layout permanece igual */}

        <div className="relative w-full h-80 mt-6 overflow-hidden pointer-events-none">
          <img
            src="/assets/moedas-zlp.png"
            className="absolute bottom-0 left-0 w-full h-full object-cover"
            alt="moedas"
          />
        </div>

      </main>

      <div className="fixed bottom-0 left-0 w-full z-50">
        <NavBottom />
      </div>
    </div>
  );
}