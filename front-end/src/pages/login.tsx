import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(data.message || "Erro ao fazer login.");
        return;
      }

      // ✔ SALVA TOKEN REAL
      localStorage.setItem("TOKEN_ZLPIX", data.token);

      // ✔ Redireciona para HOME
      navigate("/");
    } catch (err) {
      setError("Não foi possível conectar ao servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "150px", height: "auto" }}
          />
        </div>

        <h1 className="page-title">Entrar na sua conta</h1>
        <p className="page-subtitle">Aposte e acompanhe seus resultados</p>

        {error && (
          <p style={{ color: "#ff8080", textAlign: "center", marginBottom: "12px" }}>
            {error}
          </p>
        )}

        <label>E-mail</label>
        <input
          className="page-input"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Senha</label>
        <input
          className="page-input"
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button className="page-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p style={{ textAlign: "center", marginTop: "18px" }}>
          Não tem conta?
          <span
            className="page-link"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/cadastro")}
          >
            {" "}
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}