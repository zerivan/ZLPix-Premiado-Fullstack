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

  // 🔊 Inicializa contexto de áudio
  useEffect(() => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AC();
  }, []);

  // 🔈 Som de clique leve
  function playClickSound() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // 🔘 Seleção manual
  function toggle(num: string) {
    if (rolling) return;
    playClickSound(); // 🔈 toca ao clicar manualmente
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

    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 20 + Math.random() * 10; j++) {
        const randomNum = pool[Math.floor(Math.random() * pool.length)];
        setActiveNumber(randomNum);
        await new Promise((r) => setTimeout(r, 30));
      }

      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) chosen = pool[Math.floor(Math.random() * pool.length)];

      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
      await new Promise((r) => setTimeout(r, 100));
    }

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

  function pagarAgora() {
    navigate("/pagamento");
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i + 1));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative">
      {/* Cabeçalho */}
      <div className="py-2 shadow-md text-center bg-gradient-to-r from-blue-800 via-blue-700 to-green-600 border-b border-green-400/20">
        <h1 className="text-base font-bold text-yellow-300">
          Escolha até 3 dezenas 🎯
        </h1>
        <p className="text-xs text-blue-100">
          Selecionadas: <span className="text-yellow-300">{selected.length}</span>/3
        </p>
      </div>

      {/* Painel central compacto */}
      <main className="flex-1 flex flex-col items-center justify-center px-3 pb-24">
        <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-green-900 border border-blue-800/40 rounded-2xl p-3 shadow-inner w-full max-w-md">
          <div className="grid grid-cols-5 gap-1">
            {grid.map((n) => {
              const sel = selected.includes(n);
              const isActive = activeNumber === n && rolling;
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={rolling}
                  className={`h-8 rounded-md border text-[12px] font-bold transition-all ${
                    sel
                      ? "bg-yellow-400 text-blue-900 border-yellow-400 shadow-yellow-300/40 shadow-sm scale-105"
                      : isActive
                      ? "bg-blue-600 text-white border-blue-400"
                      : "bg-blue-950/70 text-gray-200 border-blue-800 hover:bg-blue-800 hover:scale-105"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botões principais */}
        <div className="w-full max-w-md mt-5 flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={gerarAleatorio}
              disabled={rolling}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-2 rounded-full text-sm shadow-lg"
            >
              🎲 Gerar
            </button>
            <button
              onClick={confirmarBilhete}
              disabled={selected.length !== 3 || rolling}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-full text-sm shadow-lg"
            >
              Confirmar
            </button>
          </div>

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

      {/* ✨ Efeito moedas */}
      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-32 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 8 + Math.random() * 14,
                  height: 8 + Math.random() * 14,
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
    </div>
  );
}