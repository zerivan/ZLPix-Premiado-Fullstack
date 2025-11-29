import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", paddingTop: "50px" }}>
        <p>Carregando informações...</p>
      </div>
    );
  }

  return (
    <div
      className="page-wrapper"
      style={{
        padding: "30px 20px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #101010, #1c1c1c)",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", marginBottom: "20px" }}>👤 Meu Perfil</h1>

      <div
        style={{
          background: "rgba(255,255,255,0.1)",
          padding: "20px",
          borderRadius: "14px",
          marginBottom: "20px",
        }}
      >
        <p><strong>Nome:</strong> {user.name}</p>
        <p><strong>E-mail:</strong> {user.email}</p>
        {user.phone && <p><strong>Telefone:</strong> {user.phone}</p>}
        {user.pixKey && <p><strong>Chave PIX:</strong> {user.pixKey}</p>}
        <p><strong>Criado em:</strong> {new Date(user.createdAt).toLocaleString()}</p>
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          background: "crimson",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "10px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Sair da conta
      </button>
    </div>
  );
}
