import React, { useState } from "react";
import confetti from "canvas-confetti";
import { api } from "./api/client";

export default function App() {
  const [resultado, setResultado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function sortearPremio() {
    setCarregando(true);
    try {
      const response = await api.get("/premio"); // rota simulada
      const mensagem = response.data?.mensagem || "🎉 Você ganhou!";
      setResultado(mensagem);
      soltarConfete(); // chama o efeito!
    } catch (error) {
      setResultado("❌ Erro ao se conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  }

  function soltarConfete() {
    confetti({
      particleCount: 180,
      spread: 100,
      origin: { y: 0.6 },
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 via-amber-500 to-yellow-700 text-dark">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white drop-shadow-lg">
        🎯 ZLPIX PREMIADO
      </h1>

      <button
        onClick={sortearPremio}
        disabled={carregando}
        className="bg-black text-yellow-400 px-8 py-3 rounded-2xl text-lg font-bold shadow-lg hover:bg-yellow-500 hover:text-black transition-all"
      >
        {carregando ? "🔄 Sorteando..." : "🎁 Sortear Prêmio"}
      </button>

      {resultado && (
        <div className="mt-6 text-center text-2xl font-semibold text-white animate-bounce">
          {resultado}
        </div>
      )}

      <footer className="mt-16 text-sm text-gray-200">
        © 2025 ZLPix Premiado - Todos os direitos reservados
      </footer>
    </div>
  );
}
