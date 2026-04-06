import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setMessage("Preencha todos os campos.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não coincidem.");
      return;
    }

    if (!token) {
      setMessage("Token inválido.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage("Senha atualizada com sucesso.");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message ||
          "Erro ao redefinir senha."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Redefinir senha</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        >
          {loading ? "Salvando..." : "Atualizar senha"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 15 }}>{message}</p>
      )}
    </div>
  );
}