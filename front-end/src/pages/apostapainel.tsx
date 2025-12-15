// src/pages/apostapainel.tsx
import React, { useEffect, useRef, useState } from "react";
import NavBottom from "../components/navbottom";
import { useNavigate } from "react-router-dom";

function formatNum(n: number) {
  return String(n).padStart(2, "0");
}

type LocalTicket = {
  id: string;
  nums: string[];
  valor: number;
  createdAt: string;
  pago?: boolean;
};

export default function ApostaPainel() {
  const [selected, setSelected] = useState<string[]>([]);
  const [tickets, setTickets] = useState<LocalTicket[]>([]);
  const [rolling, setRolling] = useState(false);
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [coinBurst, setCoinBurst] = useState(false);

  const navigate = useNavigate();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ZLPX_TICKETS_LOCAL");
      if (raw) setTickets(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ZLPX_TICKETS_LOCAL", JSON.stringify(tickets));
    } catch {}
  }, [tickets]);

  useEffect(() => {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    try {
      audioCtxRef.current = new AC();
    } catch {
      audioCtxRef.current = null;
    }
  }, []);

  function playClickSound() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  function toggle(num: string) {
    if (rolling) return;
    playClickSound();
    setSelected((s) => {
      if (s.includes(num)) return s.filter((x) => x !== num);
      if (s.length >= 3) return s;
      return [...s, num];
    });
  }

  function confirmarBilhete() {
    if (selected.length !== 3 || rolling) return;

    const newTicket: LocalTicket = {
      id: Date.now().toString(36),
      nums: [...selected],
      valor: 2.0,
      createdAt: new Date().toISOString(),
      pago: false,
    };

    setTickets((t) => [newTicket, ...t]);
    setSelected([]);
  }

  function desfazerUltimo() {
    if (rolling) return;
    setTickets((t) => t.slice(1));
  }

  // ✅ CORREÇÃO DEFINITIVA
  function pagarAgora() {
    if (tickets.length === 0) {
      alert("Nenhum bilhete para pagar.");
      return;
    }

    const ticketsParaPagamento = [...tickets];

    setTickets([]);
    try {
      localStorage.removeItem("ZLPX_TICKETS_LOCAL");
    } catch {}

    navigate("/revisao", {
      state: { tickets: ticketsParaPagamento },
    });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white pb-24">
      <header className="text-center py-2">
        <h1 className="text-sm font-bold text-yellow-300">
          Escolha até 3 dezenas 🎯
        </h1>
      </header>

      <main className="flex-1 px-2">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {grid.map((n) => (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`h-8 rounded-md text-xs font-bold ${
                selected.includes(n)
                  ? "bg-yellow-400 text-blue-900"
                  : "bg-blue-900 text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="max-w-md mx-auto mt-4 space-y-2">
          <button
            onClick={confirmarBilhete}
            className="w-full bg-blue-600 py-2 rounded-full font-bold"
          >
            Confirmar
          </button>

          <button
            onClick={desfazerUltimo}
            className="w-full bg-gray-600 py-2 rounded-full font-bold"
          >
            Desfazer
          </button>

          <button
            onClick={pagarAgora}
            className="w-full bg-green-500 py-2 rounded-full font-bold"
          >
            💸 Pagar Agora
          </button>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}