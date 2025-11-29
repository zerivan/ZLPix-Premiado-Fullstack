import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      const response = await api.post("/auth/login", { email, password: senha });
      const token = response.data?.token;

      if (!token) {
        setErro("Resposta inválida do servidor.");
        return;
      }

      localStorage.setItem("TOKEN_ZLPIX", token);
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
    <div
      className="page-wrapper"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        className="page-card"
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "rgba(255,255,255,0.05)",
          padding: "30px 24px",
          borderRadius: "16px",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "14px" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "120px", height: "auto" }}
          />
        </div>

        <h1 className="page-title" style={{ marginTop: 0, textAlign: "center" }}>
          Entrar na sua conta
        </h1>
        <p className="page-subtitle" style={{ textAlign: "center" }}>
          Aposte e acompanhe seus resultados
        </p>

        <form onSubmit={handleSubmit}>
          <label className="label">E-mail</label>
          <input
            className="page-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Senha</label>
          <div style={{ position: "relative" }}>
            <input
              className="page-input"
              type={mostrarSenha ? "text" : "password"}
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <span
              onClick={() => setMostrarSenha(!mostrarSenha)}
              style={{
                position: "absolute",
                right: 12,
                top: 13,
                cursor: "pointer",
                color: "var(--gold)",
                fontSize: 18,
                userSelect: "none",
              }}
              className="material-symbols-outlined"
            >
              {mostrarSenha ? "visibility_off" : "visibility"}
            </span>
          </div>

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

          <button
            type="submit"
            className="page-btn"
            disabled={loading}
            style={{ marginTop: "12px" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p
            style={{
              textAlign: "right",
              marginTop: 10,
              fontSize: "0.85rem",
              color: "var(--gold)",
              cursor: "pointer",
            }}
            onClick={() => navigate("/recuperar-senha")}
          >
            Esqueci minha senha
          </p>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
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
