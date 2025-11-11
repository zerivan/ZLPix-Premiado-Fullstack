import React, { useState } from "react";
import { Lock, User, X } from "lucide-react"; // ícones profissionais

interface Props {
  onClose: () => void;
}

export default function AdminLoginModal({ onClose }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulação de autenticação
    await new Promise((res) => setTimeout(res, 800));

    if (username === "admin" && password === "123456") {
      alert("✅ Login realizado com sucesso!");
      onClose();
    } else {
      setError("⚠️ Usuário ou senha incorretos!");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-11/12 max-w-md rounded-2xl shadow-2xl p-8 relative animate-fadeIn">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Cabeçalho */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600 mb-1">
            Painel Administrativo
          </h2>
          <p className="text-gray-500 text-sm">
            Acesso restrito — insira suas credenciais.
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Usuário
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <User className="ml-3 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 bg-transparent focus:outline-none"
                placeholder="Digite seu usuário"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Senha
            </label>
            <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
              <Lock className="ml-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-transparent focus:outline-none"
                placeholder="Digite sua senha"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-center text-sm font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* Rodapé */}
        <p className="mt-6 text-xs text-gray-400 text-center">
          © 2025 ZLPix Premiado — Acesso autorizado apenas para administradores.
        </p>
      </div>
    </div>
  );
}