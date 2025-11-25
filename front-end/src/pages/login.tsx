import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="page-wrapper">
      <div className="page-card" style={{ paddingTop: 30, paddingBottom: 30 }}>

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 25 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "150px", height: "auto" }}
          />
        </div>

        {/* TITULO */}
        <h1 className="page-title" style={{ marginBottom: 10 }}>
          Entrar na sua conta
        </h1>

        <p className="page-subtitle" style={{ marginBottom: 25 }}>
          Aposte e acompanhe seus resultados
        </p>

        {/* CAMPOS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="label">E-mail</label>
          <input
            className="page-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Senha</label>
          <input
            className="page-input"
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        {/* BOTÃO */}
        <button className="page-btn" style={{ marginTop: 22 }} onClick={() => navigate("/")}>
          Entrar
        </button>

        {/* CADASTRO */}
        <p style={{ textAlign: "center", marginTop: 20 }}>
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