import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api/client";

type Setor = {
  label: string;
  premio: number;
  color: string;
  bonus?: "free-spin";
};

const META_RESGATE = 2000;

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

  useEffect(() => {
    const rotasSemOverlay = ["/login", "/cadastro", "/recuperar-senha"];

    if (!userId || rotasSemOverlay.includes(pathname)) {
      setOpen(false);
      return;
    }

    const hoje = new Date().toDateString();
    const ultimaExibicao = localStorage.getItem("ZLP_ROLETA_OVERLAY");

    if (ultimaExibicao === hoje) {
      setOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setOpen(true);
      localStorage.setItem("ZLP_ROLETA_OVERLAY", hoje);
    }, 400);

    return () => window.clearTimeout(timer);
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
    if (open) carregarSaldo();
  }, [open]);

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
            "/zlp/checkin",
            {},
            { headers: { "x-user-id": userId } }
          );
        } catch (err) {
          console.error("Erro checkin:", err);
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
        setMessage(
          res.data?.error ||
            res.data?.message ||
            "Falha ao resgatar bilhete."
        );
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-blue-200/20 bg-gradient-to-br from-[#0b1e5b] via-[#0a2d82] to-[#051338] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/80">
              ZL PIX
            </p>
            <h2 className="text-lg font-extrabold">Roleta Premiada</h2>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-sm text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex justify-center pt-2">
            <div className="relative h-[280px] w-[280px]">
              <div className="pointer-events-none absolute left-1/2 top-[2px] z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#f8fafc] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]" />
              </div>

              <div
                className="absolute inset-0 rounded-full border-[7px] border-white/50 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition-transform duration-[3000ms] ease-out"
                style={{
                  background: gradienteRoleta,
                  transform: `rotate(${angulo}deg)`,
                }}
              >
                {setores.map((setor, i) => {
                  const passo = 360 / setores.length;
                  const meio = i * passo + passo / 2;

                  return (
                    <div
                      key={setor.label}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${meio}deg) translateY(-86px) rotate(${-meio}deg)`,
                      }}
                    >
                      <span className="block w-[76px] text-center text-[10px] font-extrabold leading-tight tracking-wide text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]">
                        {setor.label}
                      </span>
                    </div>
                  );
                })}

                <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50 bg-white/20 shadow-inner" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">Resultado</p>
            <p className="mt-1 text-base font-extrabold text-white">
              {resultado ? resultado.label : "Gire para ganhar ZLP"}
            </p>
          </div>

          <button
            onClick={girar}
            disabled={girando}
            className="w-full rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_12px_30px_rgba(34,197,94,0.45)] transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {girando ? "Girando..." : "Girar agora"}
          </button>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-100/90">
              <span>Progresso para resgate</span>
              <span>{progresso.toFixed(0)}%</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-blue-100/80">
              <span>0</span>
              <span>1000</span>
              <span>2000</span>
            </div>

            <p className="mt-3 text-center text-sm font-semibold text-blue-50">
              {podeResgatar ? "Meta atingida! Resgate liberado." : `Faltam ${faltam} ZLP`}
            </p>
          </div>

          <button
            onClick={handleResgatar}
            disabled={!podeResgatar || loadingResgatar}
            className="w-full rounded-2xl border border-amber-300/70 bg-gradient-to-r from-amber-300 to-yellow-200 px-4 py-3 text-sm font-black uppercase tracking-[0.15em] text-slate-900 shadow-[0_12px_30px_rgba(250,204,21,0.35)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingResgatar ? "Resgatando..." : "Resgatar bilhete"}
          </button>

          {message ? (
            <p className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-center text-sm text-blue-50">
              {message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}