// src/components/ZLPRoletaOverlay.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api/client";

type Setor = {
  label: string;
  premio: number;
  color: string;
  bonus?: "free-spin";
};

const META_RESGATE = 2000;

// 🔥 TEMPO (igual overlay anterior)
const BASE_IDLE = 15000;
const AUTO_CLOSE = 20000;

const setores: Setor[] = [
  { label: "100 ZLP", premio: 100, color: "#1d4ed8" },
  { label: "20 ZLP", premio: 20, color: "#2563eb" },
  { label: "80 ZLP", premio: 80, color: "#0ea5e9" },
  { label: "40 ZLP", premio: 40, color: "#059669" },
  { label: "60 ZLP", premio: 60, color: "#16a34a" },
  { label: "GIRO GRÁTIS", premio: 0, color: "#f59e0b", bonus: "free-spin" },
];

export default function ZLPRoletaOverlay() {
  const [open, setOpen] = useState(false);
  const [saldo, setSaldo] = useState(0);
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [resultado, setResultado] = useState<Setor | null>(null);
  const [loadingResgatar, setLoadingResgatar] = useState(false);
  const [message, setMessage] = useState("");

  const { pathname } = useLocation();

  const idleTimer = useRef<any>(null);
  const closeTimer = useRef<any>(null);
  const tentativas = useRef(0);

  const rotasPermitidas = ["/home", "/meus-bilhetes", "/"];

  function resolveUserId() {
    const directUserId = localStorage.getItem("USER_ID");
    if (directUserId) return String(directUserId).trim();

    const raw =
      localStorage.getItem("USER_ZLPIX") ||
      localStorage.getItem("user") ||
      "";

    if (!raw) return "";

    try {
      const parsed = JSON.parse(raw);
      return String(parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? "");
    } catch {
      return "";
    }
  }

  const userId = resolveUserId();

  function normalizar(valor: unknown) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  async function carregarSaldo() {
    if (!userId) return;

    try {
      const res = await api.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });

      setSaldo(
        normalizar(
          res.data?.saldo ??
          res.data?.wallet?.saldo ??
          res.data?.balance ??
          0
        )
      );
    } catch (err) {
      console.error("Erro saldo:", err);
    }
  }

  // 🔥 CONTROLE DE ABERTURA (IDLE)
  useEffect(() => {
    if (!rotasPermitidas.includes(pathname) || !userId) {
      setOpen(false);
      return;
    }

    function calcularDelay() {
      return Math.min(BASE_IDLE * (tentativas.current + 1), 60000);
    }

    function iniciarTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current);

      idleTimer.current = setTimeout(() => {
        setOpen(true);
        tentativas.current += 1;

        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {
          setOpen(false);
        }, AUTO_CLOSE);
      }, calcularDelay());
    }

    function handleActivity() {
      if (open) return;
      iniciarTimer();
    }

    const eventos = ["mousemove", "mousedown", "keydown", "touchstart"];

    eventos.forEach((e) => window.addEventListener(e, handleActivity));

    iniciarTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      eventos.forEach((e) => window.removeEventListener(e, handleActivity));
    };
  }, [pathname, open, userId]);

  useEffect(() => {
    if (open) carregarSaldo();
  }, [open]);

  function calcularSetor(grau: number) {
    const tamanho = 360 / setores.length;
    const ajustado = (360 - ((grau + 90) % 360)) % 360;
    const index = Math.floor(ajustado / tamanho);
    return setores[index] ?? setores[0];
  }

  // 🔥 CORREÇÃO PRINCIPAL AQUI
  async function girar() {
    if (girando || !userId) return;

    setGirando(true);
    setResultado(null);
    setMessage("");

    const giro = angulo + 1440 + Math.floor(Math.random() * 360);
    setAngulo(giro);

    setTimeout(async () => {
      const setor = calcularSetor(giro % 360);

      if (setor.premio > 0) {
        try {
          await api.post(
            "/zlp/creditar", // 🔥 CORRETO
            { valor: setor.premio },
            { headers: { "x-user-id": userId } }
          );

          await carregarSaldo();
        } catch (err) {
          console.error("Erro crédito roleta:", err);
        }
      }

      setResultado(setor);

      if (setor.bonus === "free-spin") {
        setMessage("🎉 Giro grátis desbloqueado!");
      }

      setGirando(false);
    }, 3000);
  }

  async function handleResgatar() {
    if (loadingResgatar || !userId) return;

    if (saldo < META_RESGATE) {
      setMessage("Saldo insuficiente.");
      return;
    }

    try {
      setLoadingResgatar(true);

      const res = await api.post(
        "/zlp/resgatar",
        {},
        { headers: { "x-user-id": userId } }
      );

      if (res.data?.ok) {
        setMessage("Bilhete criado!");
        await carregarSaldo();
      } else {
        setMessage(res.data?.message || "Erro no resgate.");
      }
    } catch (err: any) {
      setMessage("Erro ao resgatar");
    } finally {
      setLoadingResgatar(false);
    }
  }

  const progresso = Math.min((saldo / META_RESGATE) * 100, 100);
  const faltam = Math.max(META_RESGATE - saldo, 0);
  const podeResgatar = saldo >= META_RESGATE;

  const gradienteRoleta = useMemo(() => {
    const passo = 360 / setores.length;

    return `conic-gradient(${setores
      .map((s, i) => {
        const ini = i * passo;
        const fim = ini + passo;
        return `${s.color} ${ini}deg ${fim}deg`;
      })
      .join(",")})`;
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/75 backdrop-blur-md px-4">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0b1e5b] via-[#0a2d82] to-[#051338] p-5 text-white">

        <button onClick={() => setOpen(false)}>✕</button>

        <div className="text-center mb-3">
          <h2 className="font-bold">Roleta Premiada</h2>
        </div>

        <div className="flex justify-center mb-4">
          <div
            className="h-[260px] w-[260px] rounded-full transition-transform duration-[3000ms]"
            style={{
              background: gradienteRoleta,
              transform: `rotate(${angulo}deg)`
            }}
          />
        </div>

        <button onClick={girar} disabled={girando}>
          {girando ? "Girando..." : "Girar"}
        </button>

        <div className="mt-4">
          <div>{progresso.toFixed(0)}%</div>
          <div>{podeResgatar ? "Liberado" : `Faltam ${faltam}`}</div>
        </div>

        <button onClick={handleResgatar} disabled={!podeResgatar}>
          Resgatar
        </button>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}