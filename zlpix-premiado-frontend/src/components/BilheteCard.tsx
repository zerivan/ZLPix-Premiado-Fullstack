import React from "react";

interface BilheteCardProps {
  dezenas: number[];
}

export function BilheteCard({ dezenas }: BilheteCardProps) {
  return (
    <div className="border border-gold p-4 rounded-lg mt-4 bg-dark shadow-lg text-center">
      <h2 className="text-xl text-gold mb-2">🎫 Seu Bilhete</h2>
      <div className="flex justify-center gap-3 text-white text-lg font-semibold">
        {dezenas.map((n) => (
          <span key={n} className="bg-yellow-500 text-black px-3 py-1 rounded">
            {n.toString().padStart(2, "0")}
          </span>
        ))}
      </div>
    </div>
  );
      }
