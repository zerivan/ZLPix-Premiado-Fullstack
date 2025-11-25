// src/pages/login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password: senha,
      });

      const token = response.data?.token;

      if (!token) {
        setErro("Resposta inválida do servidor.");
        return;
      }

      // guarda token pro isLoggedIn() das rotas
      localStorage.setItem("TOKEN_ZLPIX", token);

      // futuro: guardar nome/email também se quiser
      // localStorage.setItem("ZLPIX_USER", JSON.stringify(response.data.user));

      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Não foi possível entrar. Verifique seus dados.";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-card">
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "150px", height: "auto" }}
          />
        </div>

        {/* TÍTULO */}
        <h1 className="page-title" style={{ marginTop: 0 }}>
          Entrar na sua conta
        </h1>
        <p className="page-subtitle">Aposte e acompanhe seus resultados</p>

        <form onSubmit={handleSubmit}>
          {/* E-MAIL */}
          <label>E-mail</label>
          <input
            className="page-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* SENHA */}
          <label>Senha</label>
          <input
            className="page-input"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {erro && (
            <p
              style={{
                color: "#ffd760",
                fontSize: "0.85rem",
                textAlign: "center",
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              {erro}
            </p>
          )}

          {/* BOTÃO */}
          <button
            type="submit"
            className="page-btn"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {/* CADASTRO */}
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