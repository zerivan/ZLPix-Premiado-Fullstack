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
    try {
      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return String(parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? "");
    } catch {
      return "";
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
        setMessage(res.data?.error || res.data?.message || "Falha ao resgatar bilhete.");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617]/75 backdrop-blur-md px-4">
      <div className="w-full max-w-md rounded-3xl border border-blue-200/20 bg-gradient-to-br from-[#0b1e5b] via-[#0a2d82] to-[#051338] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)] animate-[fadeIn_220ms_ease-out]">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/80">ZL PIX</p>
            <h2 className="text-lg font-extrabold">Roleta Premiada</h2>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-sm text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* ROLETA (inalterada) */}
        <div className="mb-8 flex justify-center">
          <div className="relative h-72 w-72 rounded-full bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300 p-[3px] shadow-[0_0_30px_rgba(253,224,71,0.45)]">
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#061742] p-3">
              <div
                className="relative h-full w-full overflow-hidden rounded-full border border-white/10 transition-transform duration-[3000ms] ease-[cubic-bezier(0.15,0.75,0.2,1)]"
                style={{ transform: `rotate(${angulo}deg)`, background: gradienteRoleta }}
              >
                <div className="absolute inset-0">
                  {setores.map((setor, i) => {
                    const anguloSetor = i * (360 / setores.length) + 30;

                    return (
                      <div
                        key={setor.label}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                        style={{ transform: `rotate(${anguloSetor}deg) translateY(-100px)` }}
                      >
                        <span
                          className="block max-w-[88px] -rotate-90 text-[11px] font-extrabold tracking-wide text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]"
                          style={{ transform: `rotate(-${anguloSetor}deg)` }}
                        >
                          {setor.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-4 border-yellow-300 bg-white shadow-[0_0_20px_rgba(250,204,21,0.8)]" />
                </div>
              </div>

              <div className="absolute left-1/2 top-[2px] z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.7)]" />
              </div>
            </div>
          </div>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="mb-4 rounded-xl border border-yellow-300/35 bg-yellow-300/10 py-3 text-center text-sm font-bold text-yellow-200">
            {resultado.bonus === "free-spin" ? "🆓 GIRO GRÁTIS" : `+${resultado.premio} ZLP`}
          </div>
        )}

        {/* GIRAR */}
        <button
          onClick={girar}
          disabled={girando}
          className="mb-4 w-full rounded-xl bg-gradient-to-r from-yellow-300 to-amber-400 py-4 text-base font-extrabold text-slate-900 shadow-[0_8px_30px_rgba(253,224,71,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {girando ? "GIRANDO..." : "GIRAR ROLETA"}
        </button>

        {/* PROGRESSO (NOVO PADRÃO VISUAL) */}
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/80 font-medium">
              {saldo} / {META_RESGATE} ZLP
            </span>
            <span className="text-green-400 font-bold">
              {Math.floor(progresso)}%
            </span>
          </div>

          <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-black/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00a148] to-[#4ae176] shadow-[0_0_14px_rgba(74,225,118,0.6)] transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-white/40">
            <span>0</span>
            <span>1000</span>
            <span>2000</span>
          </div>

          <div className="mt-2 text-right text-xs text-white/60">
            {podeResgatar ? "Bilhete liberado" : `Faltam ${faltam} ZLP`}
          </div>
        </div>

        {/* RESGATAR */}
        <button
          onClick={handleResgatar}
          disabled={!podeResgatar || loadingResgatar}
          className="w-full rounded-xl bg-gradient-to-r from-[#00a148] to-[#4ae176] py-4 text-base font-bold text-black shadow-[0_10px_30px_rgba(74,225,118,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loadingResgatar ? "RESGATANDO..." : "RESGATAR BILHETE"}
        </button>

        {message && (
          <div className="mt-4 text-center text-xs font-medium text-blue-100">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}