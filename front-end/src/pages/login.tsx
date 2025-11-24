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
        <div className="flex justify-center mb-4">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="w-44 h-auto object-contain drop-shadow-xl"
          />
        </div>

        {/* TÍTULO */}
        <h1 className="text-center mb-1">Bem-vindo de volta!</h1>

        <p className="text-center mb-6" style={{ opacity: 0.8 }}>
          Faça login para continuar
        </p>

        {/* CAMPO EMAIL */}
        <label className="mt-2 font-semibold" style={{ color: "var(--gold)" }}>
          E-mail
        </label>
        <input
          type="email"
          placeholder="seuemail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* CAMPO SENHA */}
        <label className="mt-2 font-semibold" style={{ color: "var(--gold)" }}>
          Senha
        </label>
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {/* BOTÃO LOGIN */}
        <button
          className="btn btn-primary w-full mt-3"
          style={{ height: "50px", fontSize: "1.05rem", fontWeight: 700 }}
          onClick={() => navigate("/")}
        >
          Entrar
        </button>

        {/* LINK CADASTRO */}
        <p className="center mt-4 text-sm">
          Não tem conta?
          <span
            onClick={() => navigate("/cadastro")}
            className="cursor-pointer"
            style={{ color: "var(--gold)", fontWeight: 700, marginLeft: 6 }}
          >
            Cadastre-se
          </span>
        </p>

      </div>

    </div>
  );
}