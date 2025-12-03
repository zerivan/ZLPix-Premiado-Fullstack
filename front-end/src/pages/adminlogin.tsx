import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const API_BASE = "https://zlpix-premiado-fullstack.onrender.com"; // ajuste se usar outra URL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // tenta mensagem clara do servidor
        setError(json.message || json.erro || "Usuário ou senha inválidos.");
        setLoading(false);
        return;
      }

      // espera { token, user } ou formato com ok:true
      const token = json.token || json.data?.token || (json.ok ? json.token : null);
      if (!token) {
        setError("Resposta do servidor inválida. Verifique o backend.");
        setLoading(false);
        return;
      }

      // salva token e redireciona
      localStorage.setItem("zlpix_token", token);
      // se quiser guardar usuário:
      if (json.user) localStorage.setItem("zlpix_user", JSON.stringify(json.user));
      else if (json.data?.user) localStorage.setItem("zlpix_user", JSON.stringify(json.data.user));

      // redireciona para dashboard admin (ajusta a rota se necessário)
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Erro login:", err);
      setError("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24">
      <main className="max-w-md mx-auto px-4 pt-10">
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-md bg-white/10 flex items-center justify-center mb-4">
            {/* substitua por <img src='/path/to/logo.png' /> se tiver */}
            <span className="text-yellow-300 font-bold text-xl">ZL</span>
          </div>
          <h1 className="text-3xl font-extrabold text-yellow-300">Painel Administrativo</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/6 border border-white/10 shadow-lg p-6 backdrop-blur-sm"
        >
          <label className="block mb-4">
            <span className="text-sm text-blue-100 font-medium">Usuário</span>
            <div className="mt-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-300">👤</span>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-3 py-3 rounded-lg bg-white/5 border border-white/5 placeholder:text-blue-200 text-blue-50"
                placeholder="email ou usuário"
                autoComplete="username"
                aria-label="Usuário"
              />
            </div>
          </label>

          <label className="block mb-6">
            <span className="text-sm text-blue-100 font-medium">Senha</span>
            <div className="mt-2 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-300">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-20 py-3 rounded-lg bg-white/5 border border-white/5 placeholder:text-blue-200 text-blue-50"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                aria-label="Senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-blue-100 rounded"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? "ocultar" : "mostrar"}
              </button>
            </div>
          </label>

          {error && (
            <div className="mb-4 text-center text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full bg-yellow-400 text-blue-900 font-bold shadow-md ${loading ? "opacity-70" : "hover:scale-[1.01] active:scale-95"} `}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-xs text-blue-200 mt-4 text-center">
            Acesso restrito — apenas administradores registrados.
          </p>
        </form>
      </main>

      <NavBottom />
    </div>
  );
}