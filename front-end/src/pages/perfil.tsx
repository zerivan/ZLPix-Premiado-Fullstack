// src/pages/perfil.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import NavBottom from "../components/navbottom";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("USER_ZLPIX");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("TOKEN_ZLPIX");
    localStorage.removeItem("USER_ZLPIX");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0b1221] text-yellow-300">
        <p className="text-lg animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1221] text-white font-display flex flex-col relative">
      {/* 🌈 Cabeçalho degradê */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-green-600 py-4 shadow-md border-b border-green-400/30">
        <h1 className="text-center text-lg font-extrabold text-yellow-300 drop-shadow-sm">
          👤 Meu Perfil
        </h1>
        <p className="text-center text-sm text-blue-100 mt-1">
          Gerencie suas informações da conta
        </p>
      </div>

      {/* Conteúdo principal */}
      <main className="flex-1 max-w-md mx-auto w-full px-6 py-8 pb-28">
        {/* CARD DE PERFIL */}
        <div className="bg-[#111a2e] border border-green-400/20 rounded-2xl p-6 shadow-lg text-center relative overflow-hidden">
          {/* Efeito de brilho no topo */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 animate-pulse"></div>

          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 flex items-center justify-center text-blue-900 font-extrabold text-3xl mb-3 shadow-md">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <h2 className="text-xl font-bold text-yellow-300">{user.name}</h2>
            <p className="text-sm text-blue-100">{user.email}</p>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 space-y-3 text-left text-sm">
            {user.phone && (
              <p>
                <strong className="text-yellow-300">Telefone:</strong>{" "}
                <span className="text-blue-100">{user.phone}</span>
              </p>
            )}

            {user.pixKey && (
              <p>
                <strong className="text-yellow-300">Chave PIX:</strong>{" "}
                <span className="text-blue-100">{user.pixKey}</span>
              </p>
            )}

            {user.createdAt && (
              <p>
                <strong className="text-yellow-300">Criado em:</strong>{" "}
                <span className="text-blue-100">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Botão sair */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full h-14 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all text-white font-bold shadow-md"
        >
          Sair da Conta
        </button>
      </main>

      <NavBottom />
    </div>
  );
}