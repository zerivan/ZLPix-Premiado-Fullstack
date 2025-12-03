import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import navbottom from "../components/navbottom";

export default function perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Evita erro em ambiente SSR (Render, Vite, etc)
    if (typeof window === "undefined") return;

    try {
      const userData = localStorage.getItem("USER_ZLPIX");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("TOKEN_ZLPIX");
    localStorage.removeItem("USER_ZLPIX");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-yellow-300 bg-gradient-to-b from-blue-900 via-blue-800 to-green-800">
        <p className="text-lg animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white">
        <p className="text-lg mb-4">Nenhum usuário logado.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-6 py-3 rounded-full"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24 px-5">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate(-1)}
        className="mt-4 mb-6 flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition"
      >
        <span className="material-symbols-outlined text-xl">arrow_back</span>
        Voltar
      </button>

      {/* Cabeçalho */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">👤 Meu Perfil</h1>
        <p className="text-sm text-yellow-300">Gerencie suas informações</p>
      </header>

      {/* Dados do usuário */}
      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl mb-6 space-y-2 border border-yellow-400/20 shadow-lg">
        <p>
          <strong>Nome:</strong> {user.name}
        </p>
        <p>
          <strong>E-mail:</strong> {user.email}
        </p>
        {user.phone && (
          <p>
            <strong>Telefone:</strong> {user.phone}
          </p>
        )}
        {user.pixKey && (
          <p>
            <strong>Chave PIX:</strong> {user.pixKey}
          </p>
        )}
        {user.createdAt && (
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* Botão sair */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-full font-semibold shadow-lg shadow-red-900/30"
      >
        Sair da Conta
      </button>

      {/* Menu inferior */}
      <navbottom />
    </div>
  );
}