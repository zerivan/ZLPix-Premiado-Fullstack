// src/apostapainel.tsx
import React, { useEffect, useRef, useState } from "react";
import Header from "./components/header"; // ajuste se o seu header estiver em outro path
import NavBottom from "./components/NavBottom"; // ajuste se o seu nav estiver em outro path
import { useNavigate } from "react-router-dom";

/**
 * Painel de Aposta — Modo A (Caça-níquel)
 * - Seleção manual até 3 dezenas
 * - Gerar aleatório
 * - Desfazer
 * - Confirmar (dispara animação + som tipo caça-níquel)
 * - Pagar Agora (leva para /payment)
 *
 * Ajuste imports (Header/NavBottom) conforme sua árvore de arquivos.
 */

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
      // cleanup audio on unmount
      stopSound();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(num: string) {
    if (rolling) return; // bloqueia durante animação
    if (selected.includes(num)) {
      setSelected(selected.filter((s) => s !== num));
    } else if (selected.length < 3) {
      setSelected([...selected, num]);
    } else {
      // se já tem 3, substitui a primeira (opcional) — aqui bloqueamos e mostramos breve efeito
      setSelected((prev) => {
        const copy = prev.slice(1);
        copy.push(num);
        return copy;
      });
    }
  }

  function gerarAleatorio() {
    if (rolling) return;
    const pool = Array.from({ length: 100 }, (_, i) => formatNum(i));
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
      // ramp up
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      // áudio pode falhar em alguns ambientes Termux; ignorar silenciosamente
    }
  }

  function modulateSound(speed = 1) {
    const ctx = audioCtxRef.current;
    if (!ctx || !oscRef.current || !gainRef.current) return;
    // variação de frequência para dar sensação de rotação
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
    } catch (e) {}
    oscRef.current = null;
    gainRef.current = null;
    // keep audioCtx open (optional), we'll close on unmount
  }

  // sequência de "slot" — destaca os números visualmente e cria ticket
  async function confirmSelection() {
    if (selected.length === 0 || rolling) return;
    setRolling(true);
    startSound();
    // anima cada posição (0..2) com pequena rolagem
    for (let pos = 0; pos < selected.length; pos++) {
      setRollingIndex(pos);
      // while loop de "rolagem visual" por ~900ms cada
      const start = Date.now();
      let speed = 3;
      while (Date.now() - start < 900) {
        // muda "velocidade" do som (modulação)
        const phase = (Date.now() - start) / 900;
        speed = 1 + (1 - phase) * 6; // começa rápido e desacelera
        modulateSound(speed);
        // for visual, forçamos re-render com um pequeno timeout
        // (o visual dos cartões usa rollingIndex para acender)
        // sleep 45ms
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 45));
      }
    }

    // parar som suavemente
    stopSound();

    // pequeno efeito "coin burst"
    setCoinBurst(true);
    setTimeout(() => setCoinBurst(false), 1400);

    // criar bilhete
    const newTicket = {
      nums: selected.slice(0, 3),
      id: Date.now().toString(36),
    };
    setTickets((t) => [newTicket, ...t]);
    setRolling(false);
    setRollingIndex(null);
  }

  function pagarAgora() {
    // se não tem bilhetes, não vai
    if (tickets.length === 0) {
      // se o usuário tem seleção, sugerir confirmar primeiro — aqui apenas confirmamos automaticamente
      if (selected.length) {
        confirmSelection().then(() => navigate("/payment"));
        return;
      }
      return navigate("/payment");
    }
    navigate("/payment");
  }

  // small helper to render a ticket row
  function TicketRow({ t }: { t: { nums: string[]; id: string } }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-white/80 dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex gap-2 items-center">
          {t.nums.map((n, i) => (
            <div key={i} className="h-10 w-14 flex items-center justify-center rounded-md bg-primary/10 text-primary font-bold">
              {n}
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-500">#{t.id.slice(-6)}</div>
      </div>
    );
  }

  // build grid numbers 00..99
  const grid = Array.from({ length: 100 }, (_, i) => formatNum(i));

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Header />
      <main className="max-w-5xl mx-auto p-4 pb-32">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Escolha seus números (Máx. 3)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Toque para selecionar — você pode gerar aleatório ou desfazer.</p>
        </div>

        <section className="mb-4">
          <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
            {grid.map((n) => {
              const sel = selected.includes(n);
              const isRollingHere = rolling && rollingIndex !== null && selected[rollingIndex] === n;
              return (
                <button
                  key={n}
                  onClick={() => toggle(n)}
                  disabled={rolling}
                  className={
                    "flex h-12 items-center justify-center rounded-lg border transition-shadow " +
                    (sel
                      ? "bg-primary text-white border-primary shadow-active"
                      : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white") +
                    (isRollingHere ? " animate-pulse-scale" : "")
                  }
                >
                  <span className="text-base font-bold">{n}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-3 flex-wrap">
            <button onClick={gerarAleatorio} className="h-12 rounded-full px-4 bg-primary text-white font-medium">Gerar Dezenas</button>
            <button onClick={desfazer} className="h-12 rounded-full px-4 bg-zinc-200 dark:bg-zinc-700">Desfazer</button>
            <button onClick={() => { if (!rolling) confirmSelection(); }} className={"h-12 rounded-full px-4 " + (rolling ? "bg-zinc-300 cursor-not-allowed" : "bg-blue-600 text-white")}>Confirmar Seleção</button>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Bilhetes (pré)</h3>
          {tickets.length === 0 ? (
            <div className="rounded-lg p-4 bg-white/90 dark:bg-slate-900 text-slate-600">Nenhum bilhete ainda — confirme a seleção para gerar.</div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => <TicketRow key={t.id} t={t} />)}
            </div>
          )}
        </section>

        <section className="fixed left-0 right-0 bottom-0 p-4 bg-background-light/90 dark:bg-background-dark/90 border-t z-30">
          <div className="max-w-5xl mx-auto flex gap-3">
            <button onClick={() => { /* opcional: limpar seleção */ setSelected([]); }} className="flex-1 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800">Limpar</button>
            <button onClick={pagarAgora} className="flex-1 h-14 rounded-full bg-amber-400 text-black font-bold">Pagar Agora</button>
          </div>
        </section>
      </main>

      <NavBottom />

      {/* Visual effects */}
      <div aria-hidden>
        {/* coin burst */}
        {coinBurst && (
          <div className="pointer-events-none fixed inset-0 z-40 flex items-end justify-center pb-40">
            <div className="relative w-64 h-64">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full shadow-lg"
                  style={{
                    width: 12 + Math.random() * 18,
                    height: 12 + Math.random() * 18,
                    background: "linear-gradient(180deg,#ffd700,#ffb400)",
                    transform: `translateX(${(Math.random() - 0.5) * 240}px) translateY(-${120 + Math.random() * 200}px) rotate(${Math.random()*360}deg)`,
                    opacity: 0.95,
                    transition: "transform 1s cubic-bezier(.22,.9,.22,1), opacity 1s",
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* local style for small animations */}
      <style>{`
        .shadow-active { box-shadow: 0 8px 24px rgba(59,130,246,0.18); }
        .animate-pulse-scale { animation: pulse-scale 700ms ease-in-out infinite; }
        @keyframes pulse-scale {
          0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
          50% { transform: scale(1.06); box-shadow: 0 8px 24px rgba(59,130,246,0.18); }
          100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
        }
      `}</style>
    </div>
  );
}