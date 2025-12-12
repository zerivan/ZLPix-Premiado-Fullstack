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
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [coinBurst, setCoinBurst] = useState(false);

  // 🔒 FLAG PARA EVITAR DUPLICIDADE
  const [confirmando, setConfirmando] = useState(false);

  const navigate = useNavigate();

  // resolveUserId tolerante
  function resolveUserId(): string | null {
    try {
      const direct = localStorage.getItem("USER_ID");
      if (direct) return String(direct);

      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      if (parsed && (parsed.id || parsed.userId || parsed._id)) {
        return String(parsed.id ?? parsed.userId ?? parsed._id);
      }
      if (parsed.user && (parsed.user.id || parsed.user.userId)) {
        return String(parsed.user.id ?? parsed.user.userId);
      }
      return null;
    } catch {
      return null;
    }
  }

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
      await new Promise((r) => setTimeout(r, 120));
    }

    setRolling(false);
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 900);
  }

  // ================================
  // ✅ CONFIRMAR BILHETE (SEM DUPLICAR)
  // ================================
  async function confirmarBilhete() {
    if (selected.length !== 3 || rolling || confirmando) return;

    const resolved = resolveUserId();
    if (!resolved) return alert("Erro: usuário não identificado.");
    if (!API) return alert("Erro: API não configurada.");

    setConfirmando(true); // 🔒 trava clique

    try {
      const body = {
        userId: Number(resolved),
        dezenas: [...selected],
        valorTotal: 2.0,
      };

      const res = await axios.post(`${API}/bilhete/criar`, body, {
        headers: { "Content-Type": "application/json" },
      });

      const bilhete = res.data?.bilhete ?? res.data;
      if (!bilhete) throw new Error("Bilhete inválido");

      const newTicket: LocalTicket = {
        id: String(bilhete.id),
        nums: [...selected],
        valor: 2.0,
        createdAt: new Date().toISOString(),
        pago: false,
      };

      setTickets((t) => [newTicket, ...t]);
      setSelected([]);
      setCoinBurst(true);
      setTimeout(() => setCoinBurst(false), 900);
    } catch (err: any) {
      console.error(err);
      alert("Erro ao criar bilhete.");
    } finally {
      setConfirmando(false); // 🔓 libera clique
    }
  }

  function desfazerUltimo() {
    if (rolling) return;
    setTickets((t) => t.slice(1));
  }

  function pagarAgora() {
    if (tickets.length === 0) return alert("Nenhum bilhete para pagar.");

    const userId = resolveUserId();
    if (!userId) return alert("Erro: usuário não identificado.");

    navigate("/revisao", {
      state: {
        bilhetes: tickets.map((t) => t.nums.join(",")),
        valorUnitario: 2.0,
        userId,
      },
    });
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-hidden">
      <main className="flex-1 flex flex-col items-center px-2 pt-2 pb-24 w-full">
        <div className="grid grid-cols-5 gap-[2px] max-w-md w-full">
          {grid.map((n) => (
            <button
              key={n}
              onClick={() => toggle(n)}
              className={`h-7 rounded-md text-xs font-bold ${
                selected.includes(n)
                  ? "bg-yellow-400 text-blue-900"
                  : "bg-blue-900"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md mt-4 flex flex-col gap-3">
          <button onClick={gerarAleatorio}>🎲 Gerar</button>
          <button onClick={confirmarBilhete}>Confirmar</button>
          <button onClick={desfazerUltimo}>↩️ Desfazer</button>
          <button onClick={pagarAgora}>💸 Pagar Agora</button>
        </div>
      </main>

      <NavBottom />
    </div>
  );
}