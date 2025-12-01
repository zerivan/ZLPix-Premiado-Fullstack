// front-end/src/components/sorteiotimer.tsx
import React, { useEffect, useState } from "react";

/**
 * 🔹 Timer simples e compatível com qualquer fuso horário.
 * 🔹 Usa horário UTC para evitar diferenças entre regiões.
 */
export default function SorteioTimer() {
  const [timeLeft, setTimeLeft] = useState("00d 00h 00m 00s");

  useEffect(() => {
    // Sorteio daqui a 3 dias (em UTC)
    const sorteioTimeUTC = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).getTime();

    const timer = setInterval(() => {
      const nowUTC = new Date().getTime();
      const diff = sorteioTimeUTC - nowUTC;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("00d 00h 00m 00s");
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${String(d).padStart(2, "0")}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-lg font-bold text-yellow-300 mb-1">🎯 Próximo Sorteio</h2>
      <p className="text-3xl font-bold text-white mb-2">💰 R$ 50.000</p>

      <div className="flex justify-center items-center gap-2 text-yellow-200 font-mono text-lg bg-blue-900/30 px-4 py-2 rounded-xl border border-yellow-400/20 shadow-md">
        {timeLeft}
      </div>

      <p className="text-sm text-blue-100 mt-2 italic">Sorteio em andamento... 🍀</p>
    </div>
  );
}