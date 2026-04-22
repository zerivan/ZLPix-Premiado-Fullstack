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
        setMessage("🎉 Giro grátis desbloqueado!");
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
      setMessage("Erro ao resgatar bilhete");
    } finally {
      setLoadingResgatar(false);
    }
  }

  const progresso = Math.min((saldo / META_RESGATE) * 100, 100);

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
      <div className="w-full max-w-md rounded-3xl border border-blue-200/20 bg-gradient-to-br from-[#0b1e5b] via-[#0a2d82] to-[#051338] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.55)]">

        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/80">ZL PIX</p>
            <h2 className="text-lg font-extrabold">Roleta Premiada</h2>
          </div>

          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* ROLETA */}
        <div className="mb-6 flex justify-center">
          <div className="relative h-72 w-72 rounded-full p-[3px] bg-gradient-to-br from-yellow-300 via-green-300 to-blue-300">
            <div className="relative h-full w-full rounded-full bg-[#061742] p-2 flex items-center justify-center">

              <div
                className="relative h-full w-full rounded-full overflow-hidden"
                style={{ transform: `rotate(${angulo}deg)`, background: gradienteRoleta }}
              >
                {setores.map((setor, i) => {
                  const ang = i * (360 / setores.length);

                  return (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `rotate(${ang}deg) translateY(-95px)` }}
                    >
                      <span
                        className="text-[11px] font-bold text-white"
                        style={{ transform: `rotate(-${ang}deg)` }}
                      >
                        {setor.label}
                      </span>
                    </div>
                  );
                })}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-white border-4 border-yellow-300" />
                </div>
              </div>

              {/* ponteiro */}
              <div className="absolute top-[4px] left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-yellow-300"></div>
              </div>

            </div>
          </div>
        </div>

        {/* RESULTADO */}
        {resultado && (
          <div className="text-center text-yellow-300 font-bold mb-3">
            {resultado.bonus ? "GIRO GRÁTIS" : `+${resultado.premio} ZLP`}
          </div>
        )}

        <button
          onClick={girar}
          disabled={girando}
          className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl mb-3"
        >
          {girando ? "GIRANDO..." : "GIRAR"}
        </button>

        {/* PROGRESSO */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-green-400" style={{ width: `${progresso}%` }} />
        </div>

      </div>
    </div>
  );
}