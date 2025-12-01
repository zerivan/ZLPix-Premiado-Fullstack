import React, { useEffect, useState } from "react";

export default function SorteioTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // define a data do sorteio (exemplo: 3 dias a partir de agora)
    const sorteioTime = Date.now() + 3 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = sorteioTime - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const circleClass =
    "flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-green-400 text-blue-900 font-extrabold rounded-full shadow-lg w-16 h-16 text-xl animate-pulse-slow";

  const labelClass = "text-xs text-yellow-200 mt-1";

  return (
    <div className="text-center mt-4">
      <h2 className="text-xl text-yellow-300 font-bold mb-3">🎯 Próximo Sorteio</h2>
      <p className="text-3xl font-bold text-white mb-2">💰 R$ 50.000</p>

      <div className="flex justify-center gap-3 mb-3">
        <div className="flex flex-col items-center">
          <div className={circleClass}>{timeLeft.days}</div>
          <span className={labelClass}>dias</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={circleClass}>{timeLeft.hours}</div>
          <span className={labelClass}>h</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={circleClass}>{timeLeft.minutes}</div>
          <span className={labelClass}>min</span>
        </div>
        <div className="flex flex-col items-center">
          <div className={circleClass}>{timeLeft.seconds}</div>
          <span className={labelClass}>seg</span>
        </div>
      </div>

      <p className="text-sm text-blue-100 italic">Sorteio em andamento... 🍀</p>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 255, 255, 0.2); }
          50% { transform: scale(1.08); box-shadow: 0 0 18px rgba(255, 255, 255, 0.4); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}