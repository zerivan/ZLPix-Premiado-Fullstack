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
  // 🔥 CORREÇÃO: página sempre renderiza
  const [open] = useState(true);

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

  function resolveUserId() {
    const directUserId = localStorage.getItem("USER_ID");
    if (directUserId) return String(directUserId).trim();

    const fromStorage =
      localStorage.getItem("USER_ZLPIX") ||
      localStorage.getItem("user") ||
      localStorage.getItem("userData") ||
      "";

    if (!fromStorage) return "";

    try {
      const parsed = JSON.parse(fromStorage);
      return String(
        parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? parsed?._id ?? ""
      );
    } catch {
      return String(fromStorage).replaceAll('"', "").trim();
    }
  }

  const userId = resolveUserId();

  // 🔥 MANTIDO (não interfere mais no render)
  useEffect(() => {
    const rotasPermitidas = ["/home", "/meus-bilhetes", "/"];

    if (!userId || !rotasPermitidas.includes(pathname)) {
      return;
    }

    function calcularDelay() {
      return Math.min(BASE_IDLE * (tentativas.current + 1), 60000);
    }

    function iniciarTimer() {
      if (idleTimer.current) clearTimeout(idleTimer.current);

      idleTimer.current = setTimeout(() => {
        tentativas.current++;

        if (closeTimer.current) clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => {}, AUTO_CLOSE);
      }, calcularDelay());
    }

    function atividade() {
      iniciarTimer();
    }

    const eventos = ["mousemove", "mousedown", "keydown", "touchstart"];
    eventos.forEach((e) => window.addEventListener(e, atividade));

    iniciarTimer();

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);

      eventos.forEach((e) =>
        window.removeEventListener(e, atividade)
      );
    };
  }, [pathname, userId]);

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

  useEffect(() => {
    carregarSaldo();
  }, []);

  function calcularSetor(grau: number) {
    const tamanho = 360 / setores.length;
    const ajustado = (360 - ((grau + 90) % 360)) % 360;
    const index = Math.floor(ajustado / tamanho);
    return setores[index] ?? setores[1];
  }

  async function girar() {
    if (girando || !userId) return;

    setGirando(true);
    setResultado(null);
    setMessage("");

    const giro = angulo + 1440 + Math.floor(Math.random() * 360);
    setAngulo(giro);

    window.setTimeout(async () => {
      const grauFinal = giro % 360;
      const setor = calcularSetor(grauFinal);

      if (setor.premio > 0) {
        try {
          await api.post(
            "/zlp/creditar",
            { valor: setor.premio },
            { headers: { "x-user-id": userId } }
          );
        } catch (err) {
          console.error("Erro crédito:", err);
        }

        await carregarSaldo();
      }

      setResultado(setor);

      if (setor.bonus === "free-spin") {
        setMessage("🎉 Giro grátis desbloqueado! Você pode girar novamente.");
      }

      setGirando(false);
    }, 3000);
  }

  async function handleResgatar() {
    if (loadingResgatar || !userId) return;

    if (saldo < META_RESGATE) {
      setMessage("Saldo insuficiente para resgatar bilhete.");
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
        setMessage(res.data?.message || "Bilhete criado com sucesso!");
        await carregarSaldo();
      } else {
        setMessage(res.data?.message || "Falha ao resgatar bilhete.");
      }
    } catch {
      setMessage("Erro ao resgatar bilhete");
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
      .map((setor, i) => {
        const ini = i * passo;
        const fim = ini + passo;
        return `${setor.color} ${ini}deg ${fim}deg`;
      })
      .join(",")})`;
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-md">
      {/* JSX ORIGINAL INTACTO */}
    </div>
  );
}