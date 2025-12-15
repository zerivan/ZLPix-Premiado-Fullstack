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

  // audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // load persisted tickets
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

  function startRollingSound() {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}
  }

  function modulateRollingSound(speed = 1) {
    try {
      if (!audioCtxRef.current || !oscRef.current) return;
      const now = audioCtxRef.current.currentTime;
      const base = 180;
      oscRef.current.frequency.cancelScheduledValues(now);
      oscRef.current.frequency.linearRampToValueAtTime(base * speed, now + 0.05);
    } catch {}
  }

  function stopRollingSound() {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    const now = ctx.currentTime;
    try {
      gainRef.current.gain.linearRampToValueAtTime(0.0001, now + 0.15);
      oscRef.current.stop(now + 0.25);
    } catch {}
    oscRef.current = null;
    gainRef.current = null;
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

  async function gerarAleatorio() {
    if (rolling) return;
    setRolling(true);
    setSelected([]);
    startRollingSound();

    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      const spins = 25 + Math.floor(Math.random() * 20);
      for (let j = 0; j < spins; j++) {
        const randomNum = pool[Math.floor(Math.random() * pool.length)];
        setActiveNumber(randomNum);
        modulateRollingSound(1 + Math.random() * 3.5);
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 40));
      }

      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) {
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }

      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
      await new Promise((r) => setTimeout(r, 120));
    }

    stopRollingSound();
    setActiveNumber(null);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 900);
    setRolling(false);
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
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 900);
  }

  function desfazerUltimo() {
    if (rolling) return;
    setTickets((t) => t.slice(1));
  }

  // ✅ CORREÇÃO AQUI
  function pagarAgora() {
    if (tickets.length === 0) {
      alert("Nenhum bilhete para pagar.");
      return;
    }

    const ticketsParaPagamento = [...tickets];

    // 🔥 LIMPA BILHETES TEMPORÁRIOS
    setTickets([]);
    try {
      localStorage.removeItem("ZLPX_TICKETS_LOCAL");
    } catch {}

    navigate("/revisao", {
      state: {
        tickets: ticketsParaPagamento,
      },
    });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-hidden">
      {/* TODO O JSX VISUAL INTACTO */}
      {/* ... */}
      <NavBottom />
    </div>
  );
}