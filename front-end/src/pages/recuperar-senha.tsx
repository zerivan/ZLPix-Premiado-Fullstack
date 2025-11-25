// src/pages/recuperar-senha.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email) {
      setMsg("Digite seu e-mail.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Quando criarmos a rota no backend, enviaremos aqui
      // await api.post("/auth/recover", { email });

      setMsg(
        "Se este e-mail estiver cadastrado, enviaremos instruções para recuperar sua senha."
      );
    } catch (err) {
      setMsg("Erro ao solicitar recuperação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-card">

        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            style={{ width: "140px" }}
          />
        </div>

        <h1 className="page-title" style={{ marginTop: 0 }}>
          Recuperar Senha
        </h1>

        <p className="page-subtitle">Informe seu e-mail para continuar</p>

        <form onSubmit={handleSubmit}>
          <label className="label">E-mail</label>
          <input
            className="page-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* MENSAGEM */}
          {msg && (
            <p
              style={{
                color: "var(--gold)",
                textAlign: "center",
                fontSize: "0.9rem",
                marginBottom: 8,
                marginTop: 6,
              }}
            >
              {msg}
            </p>
          )}

          <button
            className="page-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>

        {/* VOLTAR */}
        <p style={{ textAlign: "center", marginTop: 18 }}>
          Lembrou sua senha?
          <span
            className="page-link"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            {" "}
            Fazer login
          </span>
        </p>
      </div>
    </div>
  );
}
