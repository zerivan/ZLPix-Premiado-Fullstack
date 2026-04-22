import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ZLPRoletaOverlay() {
  const [open, setOpen] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [girando, setGirando] = useState(false);
  const [angulo, setAngulo] = useState(0);
  const [resultado, setResultado] = useState<number | null>(null);

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

  function normalizar(valor: any) {
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
  }

  async function carregarSaldo() {
    try {
      const res = await api.get("/zlp/saldo", {
        headers: { "x-user-id": userId },
      });
      setSaldo(normalizar(res.data?.saldo));
    } catch (err) {
      console.error("Erro saldo:", err);
    }
  }

  useEffect(() => {
    if (open) carregarSaldo();
  }, [open]);

  const setores = [100, 20, 80, 40, 60, 0];

  function calcularPremio(grau: number) {
    const tamanho = 360 / setores.length;
    const ajustado = (360 - ((grau + 90) % 360)) % 360;
    const index = Math.floor(ajustado / tamanho);
    return setores[index] ?? 20;
  }

  async function girar() {
    if (girando) return;

    setGirando(true);
    setResultado(null);

    const giro = 1440 + Math.floor(Math.random() * 360);
    setAngulo(giro);

    setTimeout(async () => {
      const grauFinal = giro % 360;
      const ganho = calcularPremio(grauFinal);

      if (ganho !== 0) {
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

      setResultado(ganho);
      setGirando(false);
    }, 3000);
  }

  if (!open) return null;

  const progresso = Math.min((saldo / 2000) * 100, 100);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">

      <div className="w-full max-w-sm text-white rounded-2xl p-4 bg-gradient-to-br from-[#020a12] via-[#061d2b] to-[#0b3d2e]">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold">ZL PIX</span>
          <button onClick={() => setOpen(false)} className="text-white/50">✕</button>
        </div>

        {/* ROLETA */}
        <div className="flex justify-center mb-6">

          <div className="relative w-64 h-64 rounded-full p-1 bg-gradient-to-br from-yellow-400 via-green-400 to-blue-500">

            <div className="w-full h-full rounded-full bg-[#020a12] p-3 flex items-center justify-center">

              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3000ms]"
                style={{
                  transform: `rotate(${angulo}deg)`,
                  background: `
                    conic-gradient(
                      #1e3a8a 0deg 60deg,
                      #14532d 60deg 120deg,
                      #1e3a8a 120deg 180deg,
                      #166534 180deg 240deg,
                      #facc15 240deg 300deg,
                      #7e22ce 300deg 360deg
                    )
                  `,
                }}
              >

                {/* TEXTOS CORRIGIDOS (CENTRO REAL DE CADA SETOR) */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">

                  {[
                    { label: "100", rot: 0 },
                    { label: "20", rot: 60 },
                    { label: "80", rot: 120 },
                    { label: "40", rot: 180 },
                    { label: "60", rot: 240 },
                    { label: "TENTE", rot: 300 },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `
                          rotate(${item.rot}deg)
                          translateY(-95px)
                          rotate(-${item.rot}deg)
                        `,
                        transformOrigin: "center"
                      }}
                    >
                      {item.label}
                    </div>
                  ))}

                </div>

                {/* CENTRO */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>

              </div>

              {/* 🔥 PONTEIRO REALMENTE CENTRAL */}
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent border-b-yellow-400"></div>
              </div>

            </div>
          </div>
        </div>

        {/* RESULTADO */}
        {resultado !== null && (
          <div className="text-center text-yellow-300 font-bold mb-3">
            {resultado === 0 ? "TENTE OUTRA VEZ" : `+${resultado} ZLP`}
          </div>
        )}

        {/* BOTÃO */}
        <button
          onClick={girar}
          disabled={girando}
          className="w-full py-3 bg-yellow-400 text-black font-bold rounded-xl mb-3"
        >
          {girando ? "GIRANDO..." : "GIRAR"}
        </button>

        {/* PROGRESSO */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400"
            style={{ width: `${progresso}%` }}
          />
        </div>

      </div>
    </div>
  );
}