// src/pages/apostapainel.tsx
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import NavBottom from "../components/navbar";
import { useNavigate } from "react-router-dom";

function formatNum(n: number) {
  return String(n).padStart(2, "0");
}

export default function ApostaPainel() {
  const [selected, setSelected] = useState<string[]>([]);
  const [tickets, setTickets] = useState<{ nums: string[]; id: string }[]>([]);
  const [rolling, setRolling] = useState(false);
  const [rollingIndex, setRollingIndex] = useState<number | null>(null);
  const [coinBurst, setCoinBurst] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopSound();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  function toggle(num: string) {
    if (rolling) return;
    if (selected.includes(num)) {
      setSelected(selected.filter((s) => s !== num));
    } else if (selected.length < 3) {
      setSelected([...selected, num]);
    }
  }

  function gerarAleatorio() {
    if (rolling) return;
    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i));
    const pick: string[] = [];
    while (pick.length < 3) {
      const n = pool[Math.floor(Math.random() * pool.length)];
      if (!pick.includes(n)) pick.push(n);
    }
    setSelected(pick);
  }

  function desfazer() {
    if (rolling) return;
    setSelected([]);
  }

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
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {}
  }

  function modulateSound(speed = 1) {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    const now = ctx.currentTime;
    const base = 220;
    oscRef.current.frequency.cancelScheduledValues(now);
    oscRef.current.frequency.linearRampToValueAtTime(base * speed, now + 0.02);
  }

  function stopSound() {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    const now = ctx.currentTime;
    gainRef.current.gain.cancelScheduledValues(now);
    gainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.25);
    try {
      oscRef.current.stop(now + 0.3);
    } catch (e) {}
    oscRef.current = null;
    gainRef.current = null;
  }

  async function confirmSelection() {
    if (selected.length === 0 || rolling) return;

    setRolling(true);
    startSound();

    for (let pos = 0; pos < selected.length; pos++) {
      setRollingIndex(pos);
      const start = Date.now();
      while (Date.now() - start < 900) {
        const phase = (Date.now() - start) / 900;
        const speed = 1 + (1 - phase) * 6;
        modulateSound(speed);
        await new Promise((r) => setTimeout(r, 45));
      }
    }

    stopSound();

    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1400);

    const newTicket = {
      nums: selected.slice(0, 3),
      id: Date.now().toString(36),
    };

    setTickets((t) => [newTicket, ...t]);

    setRolling(false);
    setRollingIndex(null);
  }

  function pagarAgora() {
    if (tickets.length === 0) {
      if (selected.length) {
        confirmSelection().then(() => {
          navigate("/pagamento/sucesso", { state: { dezenas: selected } });
        });
        return;
      }
      return navigate("/pagamento/sucesso");
    }

    // leva as dezenas do primeiro bilhete
    navigate("/pagamento/sucesso", { state: { dezenas: tickets[0].nums } });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Header />

      <main className="max-w-5xl mx-auto p-4 pb-32">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Escolha seus números (Máx. 3)</h2>

        <div className="grid grid-cols-5 gap-2 md:grid-cols-10 mb-6">
          {grid.map((n) => {
            const sel = selected.includes(n);
            const isRolling = rolling && rollingIndex !== null && selected[rollingIndex] === n;

            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                disabled={rolling}
                className={
                  "flex h-12 items-center justify-center rounded-lg border " +
                  (sel
                    ? "bg-primary text-white border-primary shadow-active"
                    : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white") +
                  (isRolling ? " animate-pulse-scale" : "")
                }
              >
                <span className="text-base font-bold">{n}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 mb-6 flex-wrap">
          <button onClick={gerarAleatorio} className="h-12 rounded-full px-4 bg-primary text-white font-medium">Gerar</button>
          <button onClick={desfazer} className="h-12 rounded-full px-4 bg-zinc-200 dark:bg-zinc-700">Desfazer</button>
          <button
            onClick={() => !rolling && confirmSelection()}
            className={`h-12 rounded-full px-4 ${rolling ? "bg-zinc-300" : "bg-blue-600 text-white"}`}
          >
            Confirmar Seleção
          </button>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Bilhetes (pré)</h3>

        {tickets.length === 0 ? (
          <div className="rounded-lg p-4 bg-white/90 dark:bg-slate-900 text-slate-600">
            Nenhum bilhete ainda — confirme a seleção para gerar.
          </div>
        ) : (
          <div className="space-y-2 mb-20">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 dark:bg-slate-900 p-3 shadow-sm">
                <div className="flex gap-2">
                  {t.nums.map((n) => (
                    <div key={n} className="h-10 w-12 flex items-center justify-center rounded-full bg-green-500 text-white font-bold">
                      {n}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-slate-500">#{t.id.slice(-6)}</span>
              </div>
            ))}
          </div>
        )}

        <section className="fixed left-0 right-0 bottom-0 p-4 bg-background-light/90 dark:bg-background-dark/90 border-t z-30">
          <div className="max-w-5xl mx-auto flex gap-3">
            <button onClick={() => setSelected([])} className="flex-1 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800">Limpar</button>
            <button onClick={pagarAgora} className="flex-1 h-14 rounded-full bg-amber-400 text-black font-bold">Pagar Agora</button>
          </div>
        </section>
      </main>

      <NavBottom />

      {/* Efeito das moedas */}
      {coinBurst && (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-center pb-40 z-50">
          <div className="relative w-64 h-64">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 200}px) translateY(-${120 + Math.random() * 200}px) rotate(${Math.random()*360}deg)`,
                  opacity: 0.95,
                  transition: "transform 1s ease-out, opacity 1s ease-out",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .shadow-active { box-shadow: 0 8px 24px rgba(59,130,246,0.18); }
        .animate-pulse-scale { animation: pulse-scale 700ms ease-in-out infinite; }
        @keyframes pulse-scale {
          0% { transform: scale(1); }
          50% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
