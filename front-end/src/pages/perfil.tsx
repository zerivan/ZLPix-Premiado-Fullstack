import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("TOKEN_ZLPIX");
    const userData = localStorage.getItem("USER_ZLPIX");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Erro ao interpretar usuário:", err);
        localStorage.removeItem("USER_ZLPIX");
        navigate("/login");
      }
    }

    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("TOKEN_ZLPIX");
    localStorage.removeItem("USER_ZLPIX");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-gradient-to-b from-blue-900 via-blue-800 to-green-800">
        <p className="text-lg animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-gradient-to-b from-blue-900 via-blue-800 to-green-800">
        <p className="text-lg">Nenhum usuário logado.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-6 py-3 rounded-full bg-yellow-400 text-blue-900 font-bold"
        >
          Fazer Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white p-5 font-display pb-24">
      <header className="text-center mb-6">
        <div className="flex flex-col items-center mb-3">
          <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 text-3xl font-extrabold shadow-lg">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
        <h1 className="text-2xl font-bold">{user.name || "Usuário"}</h1>
        <p className="text-sm text-yellow-300">{user.email}</p>
      </header>

      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl mb-6 border border-yellow-400/20 shadow-md space-y-2">
        <p><strong>Nome:</strong> {user.name || "Não informado"}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
        {user.phone && <p><strong>Telefone:</strong> {user.phone}</p>}
        {user.pixKey && <p><strong>Chave PIX:</strong> {user.pixKey}</p>}
        {user.createdAt && (
          <p>
            <strong>Conta criada em:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-full font-semibold shadow-lg"
      >
        Sair da Conta
      </button>

      <NavBottom />
    </div>
  );
}