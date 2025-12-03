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

  // 🎵 Som dos números
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

  // 🔘 Seleção manual
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-y-auto">
      {/* 🌟 Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-green-600 py-3 shadow-lg border-b border-green-500/20">
        <h1 className="text-center text-lg font-extrabold text-yellow-300">
          Escolha até 3 dezenas por jogo 🎯
        </h1>
        <p className="text-center text-sm text-blue-100">
          Você escolheu{" "}
          <span className="text-yellow-300">{selected.length}</span> de 3 dezenas
        </p>
      </div>

      {/* 🎲 Painel compacto */}
      <main className="flex-1 max-w-md mx-auto w-full p-3 pb-28">
        <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-green-900 border border-blue-800/40 rounded-2xl p-3 mb-6 shadow-inner">
          <div className="grid grid-cols-5 gap-1">
            {grid.map((n) => {
              const sel = selected.includes(n);
              const isActive = activeNumber === n && rolling;
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={rolling}
                  className={`h-9 rounded-lg border text-[13px] font-bold transition-all ${
                    sel
                      ? "bg-yellow-400 text-blue-900 border-yellow-400 shadow-yellow-300/40 shadow-sm"
                      : isActive
                      ? "bg-blue-600 text-white border-blue-400"
                      : "bg-blue-950/70 text-gray-200 border-blue-900 hover:bg-blue-800"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        {/* ⚙️ Botões com espaçamento confortável */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={gerarAleatorio}
            disabled={rolling}
            className={`py-2.5 rounded-full text-[13px] font-bold shadow-lg ${
              rolling
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
            }`}
          >
            🎲 Gerar
          </button>

          <button
            onClick={confirmarBilhete}
            disabled={selected.length !== 3 || rolling}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-full text-[13px] font-bold shadow-lg"
          >
            Confirmar
          </button>

          <button
            onClick={() => setSelected([])}
            disabled={rolling}
            className="bg-gray-600 hover:bg-gray-500 text-white py-2.5 rounded-full text-[13px] font-bold shadow-lg"
          >
            Limpar
          </button>
        </div>

        {/* 💳 Botão pagar */}
        <button
          onClick={pagarAgora}
          disabled={tickets.length === 0 || rolling}
          className="w-full py-3 mb-6 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-base font-extrabold shadow-lg transition-all"
        >
          💸 PAGAR AGORA
        </button>

        {/* 🎟️ Bilhetes */}
        <div>
          <h3 className="text-yellow-300 font-bold mb-2 text-center text-sm">
            Bilhetes Gerados
          </h3>
          {tickets.length === 0 ? (
            <div className="p-2 bg-blue-950/50 text-gray-300 rounded-lg text-center text-[13px]">
              Nenhum bilhete — escolha ou gere números.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-blue-950/50 p-2 rounded-lg mb-1 border border-blue-800/40"
              >
                <div className="flex gap-1">
                  {t.nums.map((n) => (
                    <div
                      key={n}
                      className="h-7 w-8 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-bold text-[12px]"
                    >
                      {n}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">#{t.id.slice(-5)}</span>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ⚙️ Rodapé fixo */}
      <NavBottom />

      {/* ✨ Efeito moedas */}
      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-40 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 8 + Math.random() * 16,
                  height: 8 + Math.random() * 16,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 200}px) translateY(-${
                    120 + Math.random() * 220
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