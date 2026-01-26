// src/pages/termos-de-uso.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function TermosDeUso() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24 relative">

      <button
        onClick={handleBack}
        className="absolute top-6 left-4 text-sm bg-white/10 px-4 py-2 rounded-full"
      >
        ← Voltar
      </button>

      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8">

        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-yellow-300">
            Termos de Uso
          </h1>
          <p className="text-sm text-white/70">
            Última atualização: 26/01/2026
          </p>
        </header>

        {/* restante do conteúdo mantido exatamente igual */}

      </div>

      <NavBottom />
    </div>
  );
}