import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import navbottom from "../components/navbottom";

export default function perfil() {
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
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <p className="text-lg animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white p-5 font-display pb-24">
      {/* Cabeçalho */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">👤 Meu Perfil</h1>
        <p className="text-sm text-yellow-300">Gerencie suas informações</p>
      </header>

      {/* Dados do usuário */}
      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl mb-6 space-y-2 border border-yellow-400/20">
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
        {user.phone && <p><strong>Telefone:</strong> {user.phone}</p>}
        {user.pixKey && <p><strong>Chave PIX:</strong> {user.pixKey}</p>}
        {user.createdAt && (
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* Botões */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-full font-semibold"
      >
        Sair da Conta
      </button>

      {/* Menu fixo */}
      <navbottom />
    </div>
  );
}