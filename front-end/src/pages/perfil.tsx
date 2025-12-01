import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      <div className="flex flex-col items-center justify-center h-screen text-white">
        <p className="text-lg animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#101010] to-[#1c1c1c] text-white p-5">
      <h1 className="text-2xl font-bold mb-6 text-center">👤 Meu Perfil</h1>

      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl mb-6 space-y-2 shadow-md">
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

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-lg font-semibold"
      >
        Sair da conta
      </button>
    </div>
  );
}