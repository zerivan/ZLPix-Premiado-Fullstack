import React, { useState } from "react";
import { api } from "./api/client";

export default function App() {
  const [resultado, setResultado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const sortearPremio = async () => {
    try {
      setCarregando(true);
      setResultado(null);
      const res = await api.get("/api/premio");
      setResultado(`🎉 ${res.data.premio}`);
    } catch (error) {
      console.error("Erro ao sortear prêmio:", error);
      setResultado("❌ Erro ao se conectar com o servidor!");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gold mb-8">🎯 ZLPIX PREMIADO</h1>

      <button
        onClick={sortearPremio}
        disabled={carregando}
        className={`px-8 py-4 text-lg font-semibold rounded-2xl transition 
          ${carregando ? "bg-gray-500" : "bg-gold hover:bg-yellow-400 text-dark"}`}
      >
        {carregando ? "⏳ Sorteando..." : "🎁 Sortear Prêmio"}
      </button>

      <div className="mt-6 text-xl">
        {resultado && <p>{resultado}</p>}
      </div>

      <footer className="absolute bottom-4 text-sm text-gray-400">
        © 2025 ZLPix Premiado - Todos os direitos reservados
      </footer>
    </div>
  );
}