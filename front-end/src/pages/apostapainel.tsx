// src/pages/apostapainel.tsx
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

  const navigate = useNavigate();

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

  async function confirmarBilhete() {
    if (selected.length !== 3 || rolling) return;
    const resolved = resolveUserId();
    if (!resolved) {
      alert("Erro: usuário não identificado. Faça login e tente novamente.");
      return;
    }

    if (!API) {
      alert("Erro: API não configurada (VITE_API_URL). Verifique .env.");
      console.error("VITE_API_URL vazio — não será possível criar bilhete.");
      return;
    }

    try {
      const body = {
        userId: resolved,
        dezenas: selected.join(","),
        valor: 2.0,
        sorteioData: new Date().toISOString(),
      };

      const res = await axios.post(`${API}/bilhete/criar`, body, {
        headers: { "Content-Type": "application/json" },
      });

      const bilhete = res.data?.bilhete ?? res.data;
      const idStr = bilhete?.id ? String(bilhete.id) : Date.now().toString(36);

      const newTicket: LocalTicket = {
        id: idStr,
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
      console.error("Erro ao criar bilhete:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao criar bilhete no servidor.";
      alert(msg);
    }
  }

  // ================================
  // ✅ FUNÇÃO CORRIGIDA (PIX)
  // ================================
  function pagarAgora() {
    if (tickets.length === 0) return alert("Nenhum bilhete para pagar.");
    const ultimo = tickets[0];

    const valor = ultimo.valor ?? 2.0;
    const descricao = `Pagamento do bilhete ${ultimo.id}`;

    navigate(
      `/pagamento?bilheteId=${encodeURIComponent(
        ultimo.id
      )}&userId=${encodeURIComponent(
        resolveUserId() || ""
      )}&valor=${encodeURIComponent(
        valor
      )}&descricao=${encodeURIComponent(descricao)}`
    );
  }

  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white relative overflow-hidden">
      <div className="py-2 text-center bg-gradient-to-r from-blue-800 via-blue-700 to-green-600 border-b border-green-400/20">
        <h1 className="text-sm font-bold text-yellow-300">Escolha até 3 dezenas 🎯</h1>
        <p className="text-xs text-blue-100">
          Selecionadas: <span className="text-yellow-300">{selected.length}</span>/3
        </p>
      </div>

      <main className="flex-1 flex flex-col items-center px-2 pt-2 pb-24 w-full">
        <div className="bg-gradient-to-b from-blue-950 via-blue-900 to-green-900 border border-blue-800/40 rounded-xl p-2 shadow-inner w-full max-w-md">
          <div className="grid grid-cols-5 gap-[2px]">
            {grid.map((n) => {
              const sel = selected.includes(n);
              const isActive = activeNumber === n && rolling;
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={rolling}
                  className={`h-7 rounded-md border text-[11px] font-bold transition-all duration-150 ${
                    sel
                      ? "bg-yellow-400 text-blue-900 border-yellow-400 scale-105 shadow-yellow-300/40"
                      : isActive
                      ? "bg-blue-600 text-white border-blue-400 animate-pulse-glow"
                      : "bg-blue-950/70 text-gray-200 border-blue-900 hover:bg-blue-800 hover:scale-105"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full max-w-md mt-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={gerarAleatorio}
              disabled={rolling}
              className={`py-2 rounded-full text-[12px] font-bold transition-all ${
                rolling
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-yellow-400 hover:bg-yellow-500 text-blue-900 shadow-lg"
              }`}
            >
              🎲 Gerar
            </button>

            <button
              onClick={confirmarBilhete}
              disabled={selected.length !== 3 || rolling}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-full text-[12px] font-bold shadow-lg"
            >
              Confirmar
            </button>

            <button
              onClick={desfazerUltimo}
              disabled={tickets.length === 0 || rolling}
              className="bg-gray-600 hover:bg-gray-500 text-gray-200 py-2 rounded-full text-[12px] font-bold shadow-lg"
            >
              ↩️ Desfazer
            </button>
          </div>

          <button
            onClick={pagarAgora}
            disabled={tickets.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 py-2.5 text-white text-base font-extrabold rounded-full shadow-lg"
          >
            💸 Pagar Agora
          </button>
        </div>

        <div className="mt-5 w-full max-w-md">
          <h3 className="text-yellow-300 text-center text-sm font-bold mb-2">
            Bilhetes Gerados
          </h3>

          {tickets.length === 0 ? (
            <div className="bg-blue-950/50 border border-blue-800/30 rounded-lg py-2 text-center text-gray-300 text-xs">
              Nenhum bilhete
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center bg-blue-950/70 border border-blue-800/40 rounded-lg p-2 mb-2"
              >
                <div className="flex gap-1">
                  {t.nums.map((n) => (
                    <span
                      key={n}
                      className="h-6 w-8 flex items-center justify-center rounded-md bg-yellow-400 text-blue-900 font-bold text-[11px]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">#{String(t.id).slice(-6)}</span>
                  <span className={`text-xs font-semibold ${t.pago ? "text-green-400" : "text-yellow-300"}`}>
                    {t.pago ? "Pago" : "Pendente"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <NavBottom />

      {coinBurst && (
        <div className="pointer-events-none fixed inset-0 flex items-end justify-center pb-28 z-40">
          <div className="relative w-64 h-64">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                style={{
                  width: 8 + Math.random() * 12,
                  height: 8 + Math.random() * 12,
                  background: "linear-gradient(180deg,#ffd700,#ffb400)",
                  transform: `translateX(${(Math.random() - 0.5) * 160}px) translateY(-${100 + Math.random() * 180}px) rotate(${Math.random() * 360}deg)`,
                  opacity: 0.95,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 6px 2px rgba(255,215,0,0.35); }
          50% { box-shadow: 0 0 14px 4px rgba(255,215,0,0.65); }
        }
        .animate-pulse-glow { animation: pulse-glow 0.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}