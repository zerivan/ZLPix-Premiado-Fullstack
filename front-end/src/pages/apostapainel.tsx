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
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  function toggle(num: string) {
    if (rolling) return;
    if (selected.includes(num)) {
      setSelected(selected.filter((s) => s !== num));
    } else if (selected.length < 3) {
      setSelected([...selected, num]);
    } else {
      setSelected((prev) => {
        const copy = prev.slice(1);
        copy.push(num);
        return copy;
      });
    }
  }

  function gerarAleatorio() {
    if (rolling) return;
    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));
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
    } catch {}
  }

  function modulateSound(speed = 1) {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current) return;
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
    } catch {}
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
    setTimeout(() => setCoinBurst(false), 1200);

    const newTicket = { nums: selected.slice(0, 3), id: Date.now().toString(36) };
    setTickets((t) => [newTicket, ...t]);
    setRolling(false);
    setRollingIndex(null);
  }

  function pagarAgora() {
    if (tickets.length === 0 && selected.length > 0) {
      confirmSelection().then(() => navigate("/pagamento"));
      return;
    }
    navigate("/pagamento");
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1221] text-white relative overflow-y-auto">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full p-3 pb-28">
        <h2 className="text-xl font-bold text-yellow-300 mb-2 text-center">
          Escolha até 3 dezenas
        </h2>

        {/* Grade compacta */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {grid.map((n) => {
            const sel = selected.includes(n);
            const highlight = rolling && rollingIndex !== null && selected[rollingIndex] === n;

            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                disabled={rolling}
                className={`h-10 rounded-lg border font-semibold text-sm transition-all ${
                  sel
                    ? "bg-yellow-400 text-blue-900 border-yellow-400"
                    : "bg-[#1c2433] text-white border-[#28334a] hover:bg-blue-700"
                } ${highlight ? "animate-pulse-scale" : ""}`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Botões */}
        <div className="flex justify-center gap-3 mb-5 flex-wrap">
          <button
            onClick={gerarAleatorio}
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold px-4 py-2 rounded-full"
          >
            Gerar Aleatório
          </button>
          <button
            onClick={desfazer}
            className="bg-gray-600 text-gray-200 px-4 py-2 rounded-full"
          >
            Desfazer
          </button>
          <button
            onClick={confirmSelection}
            disabled={rolling}
            className={`px-4 py-2 rounded-full font-bold ${
              rolling
                ? "bg-gray-400 text-gray-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Confirmar
          </button>
        </div>

        {/* Bilhetes */}
        <div className="mb-6">
          <h3 className="text-yellow-300 font-bold mb-2">Bilhetes gerados</h3>
          {tickets.length === 0 ? (
            <div className="p-3 bg-[#1b2233] text-gray-300 rounded-lg">
              Nenhum bilhete ainda — confirme sua seleção.
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

        {/* Botões fixos */}
        <div className="fixed bottom-16 left-0 right-0 px-4 pb-3 bg-[#0b1221]/95 backdrop-blur-sm border-t border-gray-800">
          <div className="flex gap-3">
            <button
              onClick={() => setSelected([])}
              className="flex-1 bg-gray-700 text-gray-200 rounded-full h-12"
            >
              Limpar
            </button>
            <button
              onClick={pagarAgora}
              className="flex-1 bg-yellow-400 text-blue-900 font-bold rounded-full h-12"
            >
              Pagar Agora
            </button>
          </div>
        </div>
      </main>

      <NavBottom />

      {/* Efeito moedas */}
      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-40 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 12 + Math.random() * 18,
                  height: 12 + Math.random() * 18,
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
        .animate-pulse-scale {
          animation: pulse-scale 0.7s ease-in-out infinite;
        }
        @keyframes pulse-scale {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}