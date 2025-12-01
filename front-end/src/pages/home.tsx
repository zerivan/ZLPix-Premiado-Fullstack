import React, { useEffect, useState } from "react";

export default function SorteioTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const sorteioTime = Date.now() + 3 * 24 * 60 * 60 * 1000; // 3 dias

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

  const circleClass = `
    flex flex-col items-center justify-center
    bg-gradient-to-b from-yellow-300 to-green-400
    text-blue-900 font-extrabold
    rounded-full shadow-md
    w-16 h-16 text-xl
    border border-yellow-200/40
    animate-pulse-slow
  `;

  const labelClass = `
    text-[11px] text-yellow-200 uppercase tracking-wider mt-1
  `;

  return (
    <div className="text-center mt-6 px-4">
      {/* Cabeçalho */}
      <h2 className="text-2xl text-yellow-300 font-bold mb-2 flex items-center justify-center gap-2">
        🎯 Próximo Sorteio
      </h2>

      <p className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg">
        💰 R$ 50.000
      </p>

      {/* Timer */}
      <div className="flex justify-center gap-4 mb-4 flex-wrap">
        {[
          { value: timeLeft.days, label: "Dias" },
          { value: timeLeft.hours, label: "Horas" },
          { value: timeLeft.minutes, label: "Min" },
          { value: timeLeft.seconds, label: "Seg" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={circleClass}>{item.value.toString().padStart(2, "0")}</div>
            <span className={labelClass}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Texto */}
      <p className="text-sm text-blue-100 italic mt-1">
        Sorteio em andamento... 🍀
      </p>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}