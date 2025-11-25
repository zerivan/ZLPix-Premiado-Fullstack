// src/pages/cadastro.tsx  
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cadastro() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      fullName,
      email,
      phone,
      pixKey,
      password,
    });

    alert("Conta criada! (Dados enviados ao console)");
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">

        {/* LOGO */}
        <div className="logo-area" style={{ textAlign: "center" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "140px", margin: "0 auto", display: "block" }}
          />
        </div>

        <h1 className="page-title">Crie sua Conta</h1>
        <p className="page-subtitle">É rápido e fácil</p>

        <form onSubmit={handleSubmit}>

          <label className="label">Nome Completo</label>
          <input
            type="text"
            className="page-input"
            placeholder="Digite seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="label">E-mail</label>
          <input
            type="email"
            className="page-input"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Telefone</label>
          <input
            type="tel"
            className="page-input"
            placeholder="(00) 90000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="label">Chave Pix</label>
          <input
            type="text"
            className="page-input"
            placeholder="Sua chave pix"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />

          <label className="label">Senha</label>
          <input
            type="password"
            className="page-input"
            placeholder="Crie uma senha forte"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="page-btn">
            Criar Conta
          </button>

          <p style={{ textAlign: "center", marginTop: "14px" }}>
            Já tem conta?
            <span
              className="page-link"
              onClick={() => navigate("/login")}
              style={{ cursor: "pointer" }}
            >
              Entrar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}