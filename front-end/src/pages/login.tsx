import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="login-wrapper">
      <div className="login-box">

        {/* LOGO */}
        <div className="logo-area">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="logo-img"
          />
        </div>

        {/* TÍTULO */}
        <h1 className="login-title">Entrar na sua conta</h1>
        <p className="login-subtitle">Aposte e acompanhe seus resultados</p>

        {/* CAMPOS */}
        <label className="label">E-mail</label>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="label">Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {/* BOTÃO LOGIN */}
        <button
          className="btn btn-primary full-btn"
          onClick={() => navigate("/")}
        >
          Entrar
        </button>

        {/* LINK PARA CADASTRO */}
        <p className="register-text">
          Não tem conta?
          <span
            className="register-link"
            onClick={() => navigate("/cadastro")}
          >
            Cadastre-se
          </span>
        </p>

      </div>
    </div>
  );
}