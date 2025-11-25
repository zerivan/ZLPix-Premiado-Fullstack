// src/pages/cadastro.tsx  
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Cadastro() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("As senhas não coincidem!");
      return;
    }

    if (!fullName || !email || !password) {
      alert("Preencha nome, e-mail e senha.");
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name: fullName,
        email,
        phone,
        pixKey,
        password
      });

      alert("Conta criada com sucesso!");
      navigate("/login");

    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Erro ao criar conta. Tente novamente.";
      alert(msg);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "150px", height: "auto" }}
          />
        </div>

        <h1 className="page-title">Crie sua Conta</h1>
        <p className="page-subtitle">É rápido e fácil</p>

        <form onSubmit={handleSubmit}>
          
          {/* Nome */}
          <label>Nome Completo</label>
          <input
            className="page-input"
            placeholder="Digite seu nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          {/* Email */}
          <label>E-mail</label>
          <input
            className="page-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Telefone */}
          <label>Telefone</label>
          <input
            className="page-input"
            type="tel"
            placeholder="(00) 90000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Pix */}
          <label>Chave Pix</label>
          <input
            className="page-input"
            placeholder="Sua chave Pix"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
          />

          {/* Senha */}
          <label>Senha</label>
          <div style={{ position: "relative" }}>
            <input
              className="page-input"
              type={showPass ? "text" : "password"}
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPass(!showPass)}
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#ffd760",
              }}
            >
              {showPass ? "visibility_off" : "visibility"}
            </span>
          </div>

          {/* Confirmar Senha */}
          <label>Confirmar Senha</label>
          <div style={{ position: "relative" }}>
            <input
              className="page-input"
              type={showConfirmPass ? "text" : "password"}
              placeholder="Repita sua senha"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
            <span
              onClick={() => setShowConfirmPass(!showConfirmPass)}
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#ffd760",
              }}
            >
              {showConfirmPass ? "visibility_off" : "visibility"}
            </span>
          </div>

          {/* Botão */}
          <button type="submit" className="page-btn">
            Criar Conta
          </button>

          {/* Login */}
          <p style={{ textAlign: "center", marginTop: "14px" }}>
            Já tem conta?
            <span
              className="page-link"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/login")}
            >
              Entrar
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}