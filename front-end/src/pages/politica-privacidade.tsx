// src/pages/politica-privacidade.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      
      {/* HEADER PADRÃO */}
      <header className="relative text-center py-6 border-b border-white/10">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-yellow-300">
          Política de Privacidade
        </h1>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        <p className="text-sm text-white/70">
          Última atualização: 26/01/2026
        </p>

        {/* restante do conteúdo permanece igual aqui */}

      </main>

      <NavBottom />
    </div>
  );
}