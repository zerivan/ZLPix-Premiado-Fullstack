import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

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
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Senha atualizada com sucesso!");
      navigate("/login");
    } catch (err: any) {
      alert(err.message || "Erro ao atualizar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wrapper}>
      <form onSubmit={handleSubmit} style={card}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Redefinir senha
        </h2>

        {/* NOVA SENHA */}
        <div style={inputContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />
          <span
            style={eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </span>
        </div>

        {/* CONFIRMAR SENHA */}
        <div style={inputContainer}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={input}
          />
          <span
            style={eye}
            onClick={() => setShowConfirm(!showConfirm)}
          >
            👁
          </span>
        </div>

        {/* NÃO SOU ROBÔ */}
        <label style={robot}>
          <input
            type="checkbox"
            checked={verified}
            onChange={() => setVerified(!verified)}
          />
          <span style={{ marginLeft: 8 }}>Não sou um robô</span>
        </label>

        <button
          type="submit"
          disabled={!verified || loading}
          style={{
            ...btn,
            background: !verified ? "#999" : "#ffd700",
            cursor: !verified ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Atualizando..." : "Atualizar senha"}
        </button>
      </form>
    </div>
  );
}

/* ===== estilos ===== */

const wrapper = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #2c3e90, #1e7a5f)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const card = {
  width: "100%",
  maxWidth: 400,
  background: "rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 24,
  backdropFilter: "blur(10px)",
  color: "#fff",
};

const inputContainer = {
  position: "relative" as const,
  marginBottom: 12,
};

const input = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  outline: "none",
  background: "#fff",
  color: "#000", // 🔥 CORREÇÃO AQUI
};

const eye = {
  position: "absolute" as const,
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
};

const robot = {
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
};

const btn = {
  width: "100%",
  padding: 14,
  borderRadius: 999,
  border: "none",
  color: "#000",
  fontWeight: "bold",
};