import React, { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import NavBottom from "../components/navbottom";
import { useNavigate } from "react-router-dom";

function formatNum(n: number) {
  return String(n).padStart(2, "0");
}

export default function ApostaPainel() {
  const [selected, setSelected] = useState<string[]>([]);
  const [tickets, setTickets] = useState<{ nums: string[]; id: string }[]>([]);
  const [rolling, setRolling] = useState(false);
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [coinBurst, setCoinBurst] = useState(false);

  const navigate = useNavigate();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      stopSound();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  function startSound() {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}
  }

  function stopSound() {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    const now = ctx.currentTime;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    try {
      oscRef.current.stop(now + 0.3);
    } catch {}
    oscRef.current = null;
    gainRef.current = null;
  }

  function modulateSound(speed = 1) {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current) return;
    const now = ctx.currentTime;
    const base = 220;
    oscRef.current.frequency.cancelScheduledValues(now);
    oscRef.current.frequency.linearRampToValueAtTime(base * speed, now + 0.02);
  }

  async function iniciarSorteio() {
    if (rolling) return;

    setRolling(true);
    startSound();
    setSelected([]);
    setActiveNumber(null);

    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      // Simula o giro piscando vários números antes de parar
      for (let j = 0; j < 20 + Math.random() * 20; j++) {
        const randomNum = pool[Math.floor(Math.random() * pool.length)];
        setActiveNumber(randomNum);
        modulateSound(1 + Math.random() * 4);
        await new Promise((r) => setTimeout(r, 60 - j));
      }

      // Escolhe número final único
      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) {
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }
      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
      await new Promise((r) => setTimeout(r, 200));
    }

    stopSound();

    // Exibe efeito de moedas/serpentina
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1200);

    // Gera o bilhete
    const newTicket = { nums: final, id: Date.now().toString(36) };
    setTickets((t) => [newTicket, ...t]);

    // Apaga o painel depois de 1.5s
    setTimeout(() => {
      setSelected([]);
      setActiveNumber(null);
      setRolling(false);
    }, 1500);
  }

  function pagarAgora() {
    navigate("/pagamento");
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1221] text-white relative overflow-y-auto">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full p-3 pb-28">
        <h2 className="text-lg font-bold text-yellow-300 mb-3 text-center">
          Sorteie até 3 dezenas
        </h2>

        {/* Painel compacto */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {grid.map((n) => {
            const sel = selected.includes(n);
            const isActive = activeNumber === n && rolling;
            return (
              <button
                key={n}
                disabled
                className={`h-9 rounded-md border font-semibold text-sm transition-all ${
                  sel
                    ? "bg-yellow-400 text-blue-900 border-yellow-400 animate-blink"
                    : isActive
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-[#1c2433] text-white border-[#28334a]"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Botões compactos */}
        <div className="flex justify-between items-center gap-2 mb-6">
          <button
            onClick={iniciarSorteio}
            disabled={rolling}
            className={`flex-1 py-2 rounded-full text-sm font-bold ${
              rolling
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
            }`}
          >
            Gerar
          </button>

          <button
            onClick={() => setSelected([])}
            disabled={rolling}
            className="flex-1 bg-gray-600 text-gray-200 py-2 rounded-full text-sm"
          >
            Limpar
          </button>

          <button
            onClick={pagarAgora}
            disabled={rolling}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-sm font-bold"
          >
            Pagar
          </button>
        </div>

        {/* Bilhetes */}
        <div className="mb-6">
          <h3 className="text-yellow-300 font-bold mb-2 text-center">
            Bilhetes Gerados
          </h3>
          {tickets.length === 0 ? (
            <div className="p-3 bg-[#1b2233] text-gray-300 rounded-lg text-center">
              Nenhum bilhete ainda — clique em <b>Gerar</b>.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-[#1b2233] p-3 rounded-lg mb-2"
              >
                <div className="flex gap-2">
                  {t.nums.map((n) => (
                    <div
                      key={n}
                      className="h-8 w-10 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-bold"
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-400">#{t.id.slice(-6)}</span>
              </div>
            ))
          )}
        </div>
      </main>

      <NavBottom />

      {/* Efeito moedas */}
      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-40 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 10 + Math.random() * 20,
                  height: 10 + Math.random() * 20,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 220}px) translateY(-${
                    120 + Math.random() * 220
                  }px) rotate(${Math.random() * 360}deg)`,
                  opacity: 0.95,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .animate-blink {
          animation: blink 0.3s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}