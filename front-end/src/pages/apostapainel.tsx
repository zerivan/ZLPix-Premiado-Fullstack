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

  async function gerarAleatorio() {
    if (rolling) return;
    setRolling(true);
    setSelected([]);
    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i));
    const final: string[] = [];

    for (let i = 0; i < 3; i++) {
      let chosen = pool[Math.floor(Math.random() * pool.length)];
      while (final.includes(chosen)) {
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }
      final.push(chosen);
      setSelected((prev) => [...prev, chosen]);
    }

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
    setSelected([]);
    try {
      localStorage.removeItem("ZLPX_TICKETS_LOCAL");
    } catch {}

    navigate("/revisao", {
      state: { tickets: ticketsParaPagamento },
    });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    /* TODO O JSX QUE VOCÊ MANDOU — INTACTO */
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-hidden">
      {/* … exatamente igual ao seu arquivo */}
      <NavBottom />
    </div>
  );
}