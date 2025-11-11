import React, { useState } from "react";
import { api } from "./api/client";

export default function App() {
  const [premio, setPremio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sortearPremio = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/premio");
      setPremio(response.data.premio);
    } catch (error) {
      console.error("Erro ao sortear prêmio:", error);
      setPremio("Erro ao conectar ao servidor 🛑");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-br from-blue-900 to-indigo-800 text-white font-sans">
      {/* Header */}
      <header className="w-full text-center py-8 shadow-md bg-gradient-to-r from-indigo-700 to-blue-600">
        <h1 className="text-4xl font-extrabold tracking-wide">🎯 ZLPix Premiado</h1>
        <p className="text-lg opacity-80 mt-2">Teste sua sorte e ganhe prêmios incríveis!</p>
      </header>

      {/* Conteúdo principal */}
      <main className="flex flex-col items-center justify-center flex-grow px-4 text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full border border-white/20">
          <h2 className="text-2xl font-semibold mb-6 text-yellow-300">🎁 Sorteio de Prêmios</h2>

          <button
            onClick={sortearPremio}
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:scale-105 hover:shadow-lg"
            }`}
          >
            {loading ? "🔄 Sorteando..." : "✨ Sortear Prêmio"}
          </button>

          {premio && (
            <div className="mt-6 p-4 rounded-xl bg-black/40 border border-yellow-400 animate-pulse">
              <p className="text-2xl font-bold text-yellow-300">{premio}</p>
            </div>
          )}
        </div>
      </main>

      {/* Rodapé */}
      <footer className="w-full bg-black/50 text-center py-4 text-sm border-t border-white/10">
        <p>© 2025 <span className="font-semibold text-yellow-400">ZLPix Premiado</span> - Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}