import React, { useEffect, useRef, useState } from "react";
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
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AC();
  }, []);

  // 🔊 Clique manual leve
  function playClickSound() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  // 🔈 Som de roleta
  function startRollingSound() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}
  }

  function modulateRollingSound(speed = 1) {
    if (!audioCtxRef.current || !oscRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const base = 180;
    oscRef.current.frequency.cancelScheduledValues(now);
    oscRef.current.frequency.linearRampToValueAtTime(base * speed, now + 0.05);
  }

  function stopRollingSound() {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    const now = ctx.currentTime;
    gainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.2);
    try {
      oscRef.current.stop(now + 0.3);
    } catch {}
    oscRef.current = null;
    gainRef.current = null;
  }

  function toggle(num: string) {
    if (rolling) return;
    playClickSound();
    if (selected.includes(num)) setSelected(selected.filter((s) => s !== num));
    else if (selected.length < 3) setSelected([...selected, num]);
  }

  async function gerarAleatorio() {
    if (rolling) return;
    setRolling(true);
    setSelected([]);
    startRollingSound(); // 🔊 inicia som da roleta

    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 25 + Math.random() * 15; j++) {
        const randomNum = pool[Math.floor(Math.random() * pool.length)];
        setActiveNumber(randomNum);
        modulateRollingSound(1 + Math.random() * 4);
        await new Promise((r) => setTimeout(r, 30));
      }

      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) chosen = pool[Math.floor(Math.random() * pool.length)];

      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
      await new Promise((r) => setTimeout(r, 120));
    }

    stopRollingSound();
    setActiveNumber(null);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1000);
    setRolling(false);
  }

  function confirmarBilhete() {
    if (selected.length !== 3 || rolling) return;
    const newTicket = { nums: [...selected], id: Date.now().toString(36) };
    setTickets((t) => [newTicket, ...t]);
    setSelected([]);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1000);
  }

  function desfazerUltimo() {
    if (tickets.length > 0 && !rolling) {
      setTickets((t) => t.slice(1));
    }
  }

  function pagarAgora() {
    navigate("/pagamento");
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-hidden">
      <div className="py-2 text-center bg-gradient-to-r from-blue-800 via-blue-700 to-green-600 border-b border-green-400/20">
        <h1 className="text-sm font-bold text-yellow-300">
          Escolha até 3 dezenas 🎯
        </h1>
        <p className="text-xs text-blue-100">
          Selecionadas: <span className="text-yellow-300">{selected.length}</span>/3
        </p>
      </div>

      <main className="flex-1 flex flex-col items-center justify-start px-2 pt-2 pb-20">
        <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-green-900 border border-blue-800/40 rounded-xl p-2 shadow-inner w-full max-w-md">
          <div className="grid grid-cols-5 gap-[2px]">
            {grid.map((n) => {
              const sel = selected.includes(n);
              const isActive = activeNumber === n && rolling;
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={rolling}
                  className={`h-7 rounded-md border text-[11px] font-bold transition-all duration-150 ${
                    sel
                      ? "bg-yellow-400 text-blue-900 border-yellow-400 scale-105 shadow-yellow-300/40"
                      : isActive
                      ? "bg-blue-600 text-white border-blue-400 animate-pulse-glow"
                      : "bg-blue-950/70 text-gray-200 border-blue-900 hover:bg-blue-800 hover:scale-105"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🎛️ Botões principais */}
        <div className="w-full max-w-md mt-4 flex flex-col gap-3">
          {/* Linha de 3 botões: Gerar, Confirmar e Desfazer */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={gerarAleatorio}
              disabled={rolling}
              className={`py-2 rounded-full text-[12px] font-bold transition-all ${
                rolling
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-blue-900 shadow-lg"
              }`}
            >
              🎲 Gerar
            </button>

            <button
              onClick={confirmarBilhete}
              disabled={selected.length !== 3 || rolling}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-[12px] font-bold shadow-lg"
            >
              Confirmar
            </button>

            <button
              onClick={desfazerUltimo}
              disabled={tickets.length === 0 || rolling}
              className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 rounded-full text-[12px] font-bold shadow-lg"
            >
              ↩️ Desfazer
            </button>
          </div>

          {/* 💳 Botão PAGAR AGORA */}
          <button
            onClick={pagarAgora}
            disabled={tickets.length === 0 || rolling}
            className="w-full bg-green-500 hover:bg-green-600 py-2.5 text-white text-base font-extrabold rounded-full shadow-lg"
          >
            💸 Pagar Agora
          </button>
        </div>
      </main>

      <NavBottom />

      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-28 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 8 + Math.random() * 12,
                  height: 8 + Math.random() * 12,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 160}px) translateY(-${
                    100 + Math.random() * 180
                  }px) rotate(${Math.random() * 360}deg)`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(255,215,0,0.4); }
          50% { box-shadow: 0 0 14px 4px rgba(255,215,0,0.7); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}