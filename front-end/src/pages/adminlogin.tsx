import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // 🔥 SENHA PRÉ-PREENCHIDA
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function entrarAdmin() {
    setErro("");
    setLoading(true);

    try {
      const resposta = await fetch(
        "https://zlpix-premiado-fullstack.onrender.com/auth/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const json = await resposta.json();

      if (!resposta.ok) {
        setErro(json.message || "Falha ao fazer login.");
        setLoading(false);
        return;
      }

      // Salvar token admin
      localStorage.setItem("TOKEN_ZLPIX_ADMIN", json.token);

      // Ir para o painel admin
      navigate("/admin-dashboard");
    } catch (e) {
      setErro("Erro ao conectar com o servidor.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 px-5 font-display">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 animate-[fadeIn_0.4s_ease-out]">
        
        <h1 className="text-center text-2xl font-extrabold text-yellow-300 mb-6 drop-shadow">
          🔐 Login Administrativo
        </h1>

        {/* EMAIL */}
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

        {/* SENHA */}
        <div className="mb-6 relative">
          <label className="text-sm text-blue-100 font-semibold">Senha</label>

          <input
            type={showPassword ? "text" : "password"}
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 bottom-4 text-yellow-300 text-sm cursor-pointer"
          >
            {showPassword ? "🙈 Ocultar" : "👁 Mostrar"}
          </span>
        </div>

        {/* ERRO */}
        {erro && (
          <p className="text-red-300 text-center text-sm mb-3 font-semibold">
            {erro}
          </p>
        )}

        {/* BOTÃO */}
        <button
          onClick={entrarAdmin}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-extrabold py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-xs text-blue-200 mt-4 opacity-70">
          Acesso restrito à administração do ZLPix
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}