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

  // 🎵 Som do sorteio
  function startSound() {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      audioCtxRef.current = ctx;
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

  function stopSound() {
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

  function modulateSound(speed = 1) {
    if (!audioCtxRef.current || !oscRef.current) return;
    const now = audioCtxRef.current.currentTime;
    const base = 180;
    oscRef.current.frequency.cancelScheduledValues(now);
    oscRef.current.frequency.linearRampToValueAtTime(base * speed, now + 0.05);
  }

  // 🎯 Clique manual no número
  function toggle(num: string) {
    if (rolling) return;
    if (selected.includes(num)) {
      setSelected(selected.filter((s) => s !== num));
    } else if (selected.length < 3) {
      setSelected([...selected, num]);
    }
  }

  // 🎰 Geração automática
  async function gerarAleatorio() {
    if (rolling) return;

    setRolling(true);
    setSelected([]);
    startSound();

    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 25 + Math.random() * 15; j++) {
        const randomNum = pool[Math.floor(Math.random() * pool.length)];
        setActiveNumber(randomNum);
        modulateSound(1 + Math.random() * 4);
        await new Promise((r) => setTimeout(r, 35));
      }

      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) {
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }

      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
      await new Promise((r) => setTimeout(r, 150));
    }

    stopSound();
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1200);
    setRolling(false);
  }

  function confirmarBilhete() {
    if (selected.length !== 3 || rolling) return;
    const newTicket = { nums: [...selected], id: Date.now().toString(36) };
    setTickets((t) => [newTicket, ...t]);
    setSelected([]);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1200);
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
    <div className="min-h-screen flex flex-col bg-[#0b1221] text-white relative overflow-y-auto">
      <Header />

      <main className="flex-1 max-w-md mx-auto w-full p-1 pb-28">
        <h2 className="text-sm font-bold text-yellow-300 mb-2 text-center">
          Escolha ou Gere suas dezenas
        </h2>

        {/* 🔢 Painel super compacto */}
        <div className="grid grid-cols-5 gap-0.5 mb-3">
          {grid.map((n) => {
            const sel = selected.includes(n);
            const isActive = activeNumber === n && rolling;
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                disabled={rolling}
                className={`h-6 rounded-md border text-[10px] font-semibold transition-all ${
                  sel
                    ? "bg-yellow-400 text-blue-900 border-yellow-400 animate-blink"
                    : isActive
                    ? "bg-blue-600 text-white border-blue-400"
                    : "bg-[#1c2433] text-gray-200 border-[#28334a] hover:bg-blue-700"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* 🎛️ Botões pequenos */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={gerarAleatorio}
            disabled={rolling}
            className={`py-2 rounded-full text-[11px] font-bold ${
              rolling
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
            }`}
          >
            Gerar
          </button>

          <button
            onClick={confirmarBilhete}
            disabled={selected.length !== 3 || rolling}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-[11px] font-bold"
          >
            Confirmar
          </button>

          <button
            onClick={desfazerUltimo}
            disabled={tickets.length === 0 || rolling}
            className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 rounded-full text-[11px]"
          >
            Desfazer
          </button>
        </div>

        {/* 💳 Botão Pagar Agora */}
        <button
          onClick={pagarAgora}
          disabled={tickets.length === 0 || rolling}
          className="w-full py-3 mb-4 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-extrabold shadow-lg transition-all"
        >
          PAGAR AGORA 💸
        </button>

        {/* 🎟️ Bilhetes */}
        <div className="mb-3">
          <h3 className="text-yellow-300 font-bold mb-2 text-center text-xs">
            Bilhetes Gerados
          </h3>
          {tickets.length === 0 ? (
            <div className="p-2 bg-[#1b2233] text-gray-400 rounded-lg text-center text-[11px]">
              Nenhum bilhete — escolha ou gere números.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-[#1b2233] p-2 rounded-lg mb-1"
              >
                <div className="flex gap-1">
                  {t.nums.map((n) => (
                    <div
                      key={n}
                      className="h-6 w-7 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-bold text-[11px]"
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <span className="text-[9px] text-gray-500">#{t.id.slice(-6)}</span>
              </div>
            ))
          )}
        </div>
      </main>

      <NavBottom />

      {/* 💰 Efeito moedas */}
      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-40 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 8 + Math.random() * 16,
                  height: 8 + Math.random() * 16,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 220}px) translateY(-${
                    120 + Math.random() * 220
                  }px) rotate(${Math.random() * 360}deg)`,
                  opacity: 0.9,
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