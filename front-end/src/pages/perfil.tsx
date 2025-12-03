import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-gradient-to-b from-blue-900 via-blue-800 to-green-800">
        <p className="text-lg animate-pulse">Carregando informações...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white font-display pb-24">
        <p className="text-lg mb-6">Nenhum usuário logado.</p>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-full shadow-md hover:bg-yellow-500 transition"
        >
          Fazer Login
        </button>
        <div className="fixed bottom-0 left-0 right-0">
          <NavBottom />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white p-5 font-display pb-24">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold">👤 Meu Perfil</h1>
        <p className="text-sm text-yellow-300">Gerencie suas informações</p>
      </header>

      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl mb-6 space-y-2 border border-yellow-400/20 shadow-lg">
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
        className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-full font-semibold shadow-md"
      >
        Sair da Conta
      </button>

      <NavBottom />
    </div>
  );
}