import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔒 NOVO: controle do "não sou robô"
  const [verified, setVerified] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!verified) {
      alert("Confirme que você não é um robô.");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Preencha todos os campos");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "https://zlpix-premiado-fullstack.onrender.com/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("Senha atualizada com sucesso!");
      navigate("/login");
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #2c3e90, #1e7a5f)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 16,
          padding: 24,
          backdropFilter: "blur(10px)",
          color: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Redefinir senha
        </h2>

        {/* NOVA SENHA */}
        <input
          type={show ? "text" : "password"}
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {/* CONFIRMAR SENHA (corrigido) */}
        <input
          type={show ? "text" : "password"}
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        {/* MOSTRAR SENHA */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          style={toggleStyle}
        >
          {show ? "Ocultar senha" : "Mostrar senha"}
        </button>

        {/* 🔒 NÃO SOU ROBÔ (TRAVA REAL) */}
        <label style={robotStyle}>
          <input
            type="checkbox"
            checked={verified}
            onChange={() => setVerified(!verified)}
          />
          <span style={{ marginLeft: 8 }}>Não sou um robô</span>
        </label>

        {/* BOTÃO BLOQUEADO */}
        <button
          type="submit"
          disabled={!verified || loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 999,
            border: "none",
            background: !verified ? "#999" : "#ffd700",
            color: "#000",
            fontWeight: "bold",
            cursor: !verified ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  borderRadius: 10,
  border: "none",
  outline: "none",
};

const toggleStyle: React.CSSProperties = {
  marginBottom: 12,
  background: "transparent",
  border: "none",
  color: "#ffd700",
  cursor: "pointer",
};

const robotStyle: React.CSSProperties = {
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  fontSize: 14,
};