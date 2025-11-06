import React from "react";

interface NumeroButtonProps {
  numero: number;
  selecionado: boolean;
  onClick: () => void;
}

export function NumeroButton({ numero, selecionado, onClick }: NumeroButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 m-1 rounded-full border-2 font-bold transition-all ${
        selecionado
          ? "bg-gold text-black border-yellow-400 scale-110"
          : "bg-dark text-gold border-gold hover:bg-yellow-600 hover:text-black"
      }`}
    >
      {numero.toString().padStart(2, "0")}
    </button>
  );
  }
