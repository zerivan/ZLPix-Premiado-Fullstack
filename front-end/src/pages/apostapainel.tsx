import React, { useEffect, useRef, useState } from "react";
import NavBottom from "../components/navbottom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = (import.meta.env.VITE_API_URL as string) || "";

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
  const [submitting, setSubmitting] = useState(false); // 🔒 LOCK REAL
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [coinBurst, setCoinBurst] = useState(false);

  const navigate = useNavigate();

  function resolveUserId(): string | null {
    try {
      const direct = localStorage.getItem("USER_ID");
      if (direct) return String(direct);

      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return String(parsed?.id ?? parsed?.userId ?? parsed?.user?._id ?? null);
    } catch {
      return null;
    }
  }

  // ================================
  // 🔊 ÁUDIO
  // ================================
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

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
      osc.frequency.value = 600;
      gain.gain.value = 0.04;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }

  // ================================
  // 🎯 SELEÇÃO
  // ================================
  function toggle(num: string) {
    if (rolling || submitting) return;
    playClickSound();

    setSelected((s) => {
      if (s.includes(num)) return s.filter((x) => x !== num);
      if (s.length >= 3) return s;
      return [...s, num];
    });
  }

  // ================================
  // 🎲 GERAR ALEATÓRIO
  // ================================
  async function gerarAleatorio() {
    if (rolling || submitting) return;

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
      setSelected((p) => [...p, chosen]);
      await new Promise((r) => setTimeout(r, 120));
    }

    setRolling(false);
  }

  // ================================
  // ✅ CONFIRMAR BILHETE (ANTI DUPLICAÇÃO)
  // ================================
  async function confirmarBilhete() {
    if (selected.length !== 3 || rolling || submitting) return;

    const userId = resolveUserId();
    if (!userId) return alert("Usuário não identificado.");

    setSubmitting(true); // 🔒 trava aqui

    try {
      const res = await axios.post(`${API}/bilhete/criar`, {
        userId: Number(userId),
        dezenas: selected,
        valorTotal: 2.0,
      });

      const bilhete = res.data?.bilhete;
      if (!bilhete) throw new Error("Bilhete inválido");

      setTickets((t) => [
        {
          id: String(bilhete.id),
          nums: [...selected],
          valor: 2.0,
          createdAt: new Date().toISOString(),
          pago: false,
        },
        ...t,
      ]);

      setSelected([]);
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 800);
    } catch (err) {
      console.error(err);
      alert("Erro ao criar bilhete.");
    } finally {
      setSubmitting(false); // 🔓 libera aqui
    }
  }

  // ================================
  // 💸 IR PARA REVISÃO
  // ================================
  function pagarAgora() {
    if (tickets.length === 0) return;

    navigate("/revisao", {
      state: {
        bilhetes: tickets.map((t) => t.nums.join(",")),
        valorUnitario: 2.0,
        userId: resolveUserId(),
      },
    });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white">
      <main className="flex-1 p-2">
        <div className="grid grid-cols-5 gap-1">
          {grid.map((n) => (
            <button
              key={n}
              disabled={rolling || submitting}
              onClick={() => toggle(n)}
              className={`h-7 rounded ${
                selected.includes(n)
                  ? "bg-yellow-400 text-blue-900"
                  : "bg-blue-900"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={gerarAleatorio} disabled={rolling || submitting}>
            🎲 Gerar
          </button>

          <button
            onClick={confirmarBilhete}
            disabled={selected.length !== 3 || submitting}
          >
            Confirmar
          </button>

          <button onClick={pagarAgora} disabled={tickets.length === 0}>
            💸 Pagar Agora
          </button>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}