import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="page-wrapper">

      <div className="page-card">
        
        {/* LOGO */}
        <div className="login-logo-box">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="login-logo"
          />
        </div>

        {/* TÍTULO */}
        <h1 className="page-title">Entrar na sua conta</h1>
        <p className="page-subtitle">Aposte e acompanhe seus resultados</p>

        {/* CAMPOS */}
        <label className="page-label">E-mail</label>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          className="page-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="page-label">Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          className="page-input"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {/* BOTÃO LOGIN */}
        <button
          className="page-btn"
          onClick={() => navigate("/")}
        >
          Entrar
        </button>

        {/* LINK PARA CADASTRO */}
        <p className="page-register">
          Não tem conta?
          <span
            className="page-link"
            onClick={() => navigate("/cadastro")}
          >
            Cadastre-se
          </span>
        </p>

      </div>
    </div>
  );
}