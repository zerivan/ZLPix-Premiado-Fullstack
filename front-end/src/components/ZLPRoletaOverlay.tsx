import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ZLPRoletaPage() {
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
    carregarSaldo();
  }, []);

  function calcularPremio(grau: number) {
    const setores = [100, 20, 80, 40, 60];
    const tamanhoSetor = 360 / setores.length;

    const ajustado = (360 - (grau % 360)) % 360;
    const index = Math.floor(ajustado / tamanhoSetor);

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
      setResultado(ganho);

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
      setGirando(false);
    }, 3000);
  }

  const progresso = Math.min((saldo / 2000) * 100, 100);
  const podeResgatar = saldo >= 2000;

  return (
    <div className="min-h-screen pb-32 text-white bg-[radial-gradient(circle_at_30%_20%,rgba(0,161,72,0.15)_0%,transparent_40%),radial-gradient(circle_at_80%_80%,rgba(74,225,118,0.12)_0%,transparent_50%),linear-gradient(135deg,#020a12_0%,#061d2b_40%,#0b3d2e_100%)]">

      <header className="fixed top-0 left-0 w-full z-50 bg-[#020a12]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-lg mx-auto">
          <h1 className="text-xl font-extrabold">ZL PIX</h1>
          <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-yellow-400">💰</span>
            <span className="font-bold">{saldo} ZLP</span>
          </div>
        </div>
      </header>

      <main className="pt-24 px-5 max-w-lg mx-auto flex flex-col items-center">

        {/* ROLETA */}
        <section className="relative w-full flex items-center justify-center mb-10">

          <div className="absolute w-80 h-80 bg-green-500/10 blur-[100px] rounded-full"></div>

          {/* 🔥 ROLETa CORRIGIDA (SEM QUEBRAR BUILD) */}
          <div className="relative w-72 h-72 rounded-full p-1 bg-gradient-to-br from-yellow-400 via-green-400 to-blue-500 shadow-lg">

            <div className="w-full h-full rounded-full bg-[#020a12] p-3 shadow-inner flex items-center justify-center">

              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3000ms] ease-out"
                style={{
                  transform: `rotate(${angulo}deg)`,
                  background: `conic-gradient(
                    #0b1e5b 0deg 72deg,
                    #14532d 72deg 144deg,
                    #1e3a8a 144deg 216deg,
                    #166534 216deg 288deg,
                    #0b1e5b 288deg 360deg
                  )`,
                }}
              >

                {/* brilho */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, white, transparent 60%)"
                  }}
                />

                {/* textos */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                  <div className="absolute top-4">100</div>
                  <div className="absolute right-6">20</div>
                  <div className="absolute bottom-6">80</div>
                  <div className="absolute left-6">40</div>
                  <div className="absolute top-1/4 left-0">60</div>
                </div>

                {/* centro */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 bg-white rounded-full shadow-md"></div>
                </div>

                {/* ponteiro */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-yellow-400"></div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {resultado && (
          <div className="text-yellow-300 font-bold text-xl mb-4">
            +{resultado} ZLP
          </div>
        )}

        <button
          onClick={girar}
          disabled={girando}
          className="w-full max-w-xs py-4 bg-gradient-to-b from-yellow-300 to-yellow-500 text-black font-bold rounded-xl shadow-lg mb-4 disabled:opacity-50"
        >
          {girando ? "GIRANDO..." : "GIRAR"}
        </button>

        <p className="text-xs text-white/40 mb-8">1 giro por dia</p>

        <div className="w-full bg-white/5 p-5 rounded-2xl mb-6">
          <div className="flex justify-between mb-2">
            <span>{saldo} / 2000 ZLP</span>
            <span className="text-green-400">{Math.floor(progresso)}%</span>
          </div>

          <div className="h-3 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 shadow-md transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        <p className="text-center text-sm text-white/60 mb-4">
          Junte <b>2000 moedas</b> para gerar um bilhete
        </p>

        <button
          disabled={!podeResgatar}
          className="w-full py-4 bg-gradient-to-r from-[#00a148] to-[#4ae176] text-black font-bold rounded-xl shadow-lg disabled:opacity-40"
        >
          RESGATAR BILHETE
        </button>

      </main>
    </div>
  );
}