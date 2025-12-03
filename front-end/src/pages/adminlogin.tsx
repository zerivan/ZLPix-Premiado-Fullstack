import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@zlpix.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/admin-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Falha no login.");
        setLoading(false);
        return;
      }

      // Salva token admin
      localStorage.setItem("adminToken", data.token);

      // Redireciona para o painel administrativo
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Erro de login admin:", err);
      setErro("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 flex items-center justify-center text-white px-6">
      <div className="w-full max-w-sm bg-blue-950/40 p-6 rounded-2xl border border-blue-500/30 shadow-xl backdrop-blur-md">
        <h1 className="text-xl font-bold text-yellow-300 text-center mb-4">
          🔐 Login Administrativo
        </h1>

        <form onSubmit={fazerLogin} className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-blue-200">E-mail</label>
            <input
              type="email"
              className="w-full p-2 rounded-lg bg-blue-900/40 border border-blue-700 text-white outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-blue-200">Senha</label>
            <input
              type="password"
              className="w-full p-2 rounded-lg bg-blue-900/40 border border-blue-700 text-white outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <p className="text-red-400 text-center text-sm mt-1">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`mt-2 py-2 rounded-full font-bold shadow-lg ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-blue-900 hover:bg-yellow-500"
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}