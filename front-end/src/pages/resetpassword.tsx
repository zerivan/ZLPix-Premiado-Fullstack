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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

        <input
          type={show ? "text" : "password"}
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <input
          type={show ? "text" : "password"}
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            marginBottom: 12,
            background: "transparent",
            border: "none",
            color: "#ffd700",
            cursor: "pointer",
          }}
        >
          {show ? "Ocultar senha" : "Mostrar senha"}
        </button>

        {/* Placeholder segurança */}
        <div
          style={{
            marginBottom: 16,
            padding: 10,
            background: "#fff",
            color: "#000",
            borderRadius: 8,
            textAlign: "center",
            fontSize: 14,
          }}
        >
          🔒 Não sou robô (simulação)
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 999,
            border: "none",
            background: "#ffd700",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
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