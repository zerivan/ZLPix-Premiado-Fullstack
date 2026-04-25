import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ZLPRoletaPage() {
  const navigate = useNavigate();

  const [saldo, setSaldo] = useState(0);
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [resultado, setResultado] = useState<Setor | null>(null);
  const [loadingResgatar, setLoadingResgatar] = useState(false);
  const [message, setMessage] = useState("");

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
        parsed?.id ??
          parsed?.user?.id ??
          parsed?.userId ??
          parsed?._id ??
          ""
      );
    } catch {
      return String(fromStorage).replaceAll('"', "").trim();
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
        setMessage(
          "🎉 Giro grátis desbloqueado! Você pode girar novamente."
        );
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
        setMessage(
          res.data?.message || "Bilhete criado com sucesso!"
        );
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

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-6">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-blue-200/20 bg-gradient-to-br from-[#0b1e5b] via-[#0a2d82] to-[#051338] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/80">
              ZL PIX
            </p>
            <h2 className="text-lg font-extrabold">
              Roleta Premiada
            </h2>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-sm text-white/70"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-center">
          <p className="text-xs text-blue-100/80">Saldo atual</p>
          <p className="text-3xl font-black text-yellow-300">
            {saldo} <span className="text-base text-yellow-200">ZLP</span>
          </p>
        </div>

        <div className="mb-5 flex justify-center">
          <div className="relative h-[300px] w-[300px]">
            <div className="absolute left-1/2 top-0 z-20 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.75)]" />

            <div
              className="absolute inset-0 rounded-full border-4 border-white/40 shadow-[0_18px_40px_rgba(3,8,26,0.6)] transition-transform duration-[3000ms] ease-out"
              style={{
                background: gradienteRoleta,
                transform: `rotate(${angulo}deg)`,
              }}
            >
              {setores.map((setor, i) => {
                const ang = (360 / setores.length) * i;
                return (
                  <div
                    key={setor.label + i}
                    className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-bottom"
                    style={{ transform: `translate(-50%, -100%) rotate(${ang}deg)` }}
                  >
                    <span
                      className="absolute left-1/2 top-2 -translate-x-1/2 text-[10px] font-black text-white drop-shadow-[0_0_4px_rgba(2,6,23,0.95)]"
                      style={{ transform: `rotate(${90 + 360 / setores.length / 2}deg)` }}
                    >
                      {setor.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="absolute left-1/2 top-1/2 z-30 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/40 bg-[#020617]/80 shadow-[0_0_0_6px_rgba(59,130,246,0.25)]" />
          </div>
        </div>

        <button
          onClick={girar}
          disabled={girando || !userId}
          className="mb-4 w-full rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-300 py-3 text-sm font-extrabold text-[#1e3a8a] shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {girando ? "Girando..." : "Girar roleta"}
        </button>

        {resultado && (
          <div className="mb-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-blue-100/80">
              Resultado
            </p>
            <p className="mt-1 text-base font-extrabold text-yellow-300">
              {resultado.label}
            </p>
          </div>
        )}

        <div className="mb-3 rounded-xl border border-white/10 bg-[#041038]/70 p-4">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-xs text-blue-100/80">Progresso para resgate</span>
            <span className="text-sm font-bold text-blue-100">
              {saldo} / {META_RESGATE} ZLP
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-950/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-yellow-300"
              style={{ width: `${progresso}%` }}
            />
          </div>

          <p className="mt-2 text-center text-xs text-blue-100/80">
            {podeResgatar
              ? "✅ Resgate liberado!"
              : `Faltam ${faltam} ZLP para liberar o resgate.`}
          </p>
        </div>

        <button
          onClick={handleResgatar}
          disabled={loadingResgatar || !podeResgatar || !userId}
          className="w-full rounded-2xl border border-blue-100/30 bg-gradient-to-r from-blue-500 to-indigo-500 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingResgatar ? "Processando resgate..." : "Resgatar bilhete"}
        </button>

        {message && (
          <div className="mt-4 rounded-xl border border-yellow-300/40 bg-yellow-300/10 px-4 py-2 text-center text-sm text-yellow-100">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}