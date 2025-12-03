// src/pages/login.tsx
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
      const user = response.data?.user;

      if (!token) {
        setErro("Resposta inválida do servidor.");
        return;
      }

      // Salva token e usuário localmente
      localStorage.setItem("TOKEN_ZLPIX", token);
      if (user) {
        localStorage.setItem("USER_ZLPIX", JSON.stringify(user));
      }

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 flex items-center justify-center p-5 font-display">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10">
        {/* Logo */}
        <div className="text-center mb-6">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="mx-auto h-16"
          />
          <h1 className="text-2xl font-bold text-yellow-300 mt-3">
            Entrar na sua conta
          </h1>
          <p className="text-sm text-white/80">
            Aposte e acompanhe seus resultados 🎯
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <span
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="material-symbols-outlined absolute right-4 top-3 text-yellow-400 cursor-pointer select-none"
            >
              {mostrarSenha ? "visibility_off" : "visibility"}
            </span>
          </div>

          {erro && (
            <p className="text-center text-yellow-300 text-sm mt-1">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-blue-900 font-bold rounded-full py-3 mt-1 hover:bg-yellow-500 transition shadow-lg"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p
            className="text-right text-yellow-300 text-sm mt-2 cursor-pointer"
            onClick={() => navigate("/recuperar-senha")}
          >
            Esqueci minha senha
          </p>

          <p className="text-center text-sm text-white/80 mt-3">
            Não tem conta?{" "}
            <span
              className="text-yellow-300 font-semibold cursor-pointer"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}