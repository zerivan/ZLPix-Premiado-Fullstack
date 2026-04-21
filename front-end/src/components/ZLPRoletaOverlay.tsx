import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

export default function ZLPRoletaOverlay() {
  const [open, setOpen] = useState(true);
  const [angulo, setAngulo] = useState(0);
  const [girando, setGirando] = useState(true);
  const [ganhoVisual, setGanhoVisual] = useState<number | null>(null);

  const spinAudio = useRef<HTMLAudioElement | null>(null);
  const winAudio = useRef<HTMLAudioElement | null>(null);

  function resolveUserId() {
    try {
      const stored = localStorage.getItem("USER_ZLPIX");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      return String(parsed?.id ?? parsed?.user?.id ?? parsed?.userId ?? "");
    } catch {
      return "";
    }
  }

  const userId = resolveUserId();

  useEffect(() => {
    // 🔊 Áudios (CDN)
    spinAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
    winAudio.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3");

    if (spinAudio.current) {
      spinAudio.current.loop = true;
      spinAudio.current.volume = 0.4;
      spinAudio.current.play().catch(() => {});
    }

    // 🎡 Gira automático
    const giro = 1440 + Math.floor(Math.random() * 360);
    setAngulo(giro);

    setTimeout(() => {
      setGirando(false);
      spinAudio.current?.pause();

      const grau = giro % 360;

      let ganho = 0;
      if (grau < 90) ganho = 10;
      else if (grau < 180) ganho = 20;
      else if (grau < 270) ganho = 30;
      else ganho = 50;

      setGanhoVisual(ganho);

      // 🔔 som vitória
      winAudio.current?.play().catch(() => {});

      receber();
    }, 3000);
  }, []);

  async function receber() {
    try {
      await api.post(
        "/zlp/checkin",
        {},
        { headers: { "x-user-id": userId } }
      );
    } catch {}

    setTimeout(() => setOpen(false), 2500);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1e5b] flex flex-col items-center justify-center text-white px-6">

      <h1 className="text-lg font-bold mb-6">
        Girando sua recompensa...
      </h1>

      {/* 🎯 Ponteiro */}
      <div className="relative mb-8">
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[20px] border-l-transparent border-r-transparent border-b-red-500" />
        </div>

        {/* 🎡 Roleta */}
        <div
          className="w-64 h-64 rounded-full border-4 border-yellow-400 transition-transform duration-[3000ms] ease-out shadow-[0_0_40px_rgba(250,204,21,0.3)]"
          style={{
            transform: `rotate(${angulo}deg)`,
            background: `
              conic-gradient(
                #facc15 0% 25%,
                #2563eb 25% 50%,
                #22c55e 50% 75%,
                #9333ea 75% 100%
              )
            `,
          }}
        />
      </div>

      {/* RESULTADO */}
      {!girando && ganhoVisual !== null && (
        <div className="text-center animate-fadeIn">
          <p className="text-2xl font-extrabold text-yellow-300">
            +{ganhoVisual} ZLP
          </p>
          <p className="text-sm text-blue-200 mt-1">
            adicionando ao seu saldo...
          </p>
        </div>
      )}
    </div>
  );
}