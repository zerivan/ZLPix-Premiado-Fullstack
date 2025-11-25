// src/pages/login.tsx
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
        <div className="flex justify-center mb-4 mt-2">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="w-[130px] h-auto"
          />
        </div>

        {/* TÍTULO */}
        <h1 className="page-title">Entrar na sua conta</h1>
        <p className="page-subtitle">Aposte e acompanhe seus resultados</p>

        {/* INPUT – EMAIL */}
        <label className="text-white font-semibold mt-2 mb-1">E-mail</label>
        <input
          className="page-input"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* INPUT – SENHA */}
        <label className="text-white font-semibold mt-2 mb-1">Senha</label>
        <input
          className="page-input"
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {/* BOTÃO */}
        <button className="page-btn mt-3" onClick={() => navigate("/")}>
          Entrar
        </button>

        {/* CADASTRO */}
        <p className="text-center mt-4 text-white">
          Não tem conta?
          <span
            className="page-link cursor-pointer ml-1"
            onClick={() => navigate("/cadastro")}
          >
            Cadastre-se
          </span>
        </p>
      </div>
    </div>
  );
}