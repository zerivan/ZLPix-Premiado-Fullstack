import React, { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@zlpix.com");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 px-5 font-display">
      {/* CARD */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.4s_ease-out]">
        
        {/* TÍTULO */}
        <h1 className="text-center text-2xl font-extrabold text-yellow-300 mb-6 drop-shadow">
          🔐 Login Administrativo
        </h1>

        {/* CAMPO EMAIL */}
        <div className="mb-4">
          <label className="text-sm text-blue-100 font-semibold">E-mail</label>
          <input
            type="email"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@zlpix.com"
          />
        </div>

        {/* CAMPO SENHA */}
        <div className="mb-6">
          <label className="text-sm text-blue-100 font-semibold">Senha</label>
          <input
            type="password"
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />
        </div>

        {/* BOTÃO ENTRAR */}
        <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-extrabold py-3 rounded-xl shadow-lg transition-all active:scale-95">
          Entrar
        </button>

        {/* TEXTO RODAPÉ */}
        <p className="text-center text-xs text-blue-200 mt-4 opacity-70">
          Acesso restrito à administração do ZLPix
        </p>
      </div>

      {/* ANIMAÇÃO KEYFRAME */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}