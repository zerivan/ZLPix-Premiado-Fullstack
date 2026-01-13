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

      // 🔐 LOGIN USUÁRIO
      const response = await api.post("/auth/login", {
        email,
        password: senha,
      });

      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error("Resposta inválida do servidor.");
      }

      // 🚫 LIMPA QUALQUER ESTADO ADMIN
      localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
      localStorage.removeItem("ZLPIX_ADMIN_AUTH");

      // 💾 SALVA DADOS DO USUÁRIO
      localStorage.setItem("TOKEN_ZLPIX", token);
      localStorage.setItem("USER_ZLPIX", JSON.stringify(user));
      localStorage.setItem("USER_ID", String(user.id));

      // 🔐 aplica token no axios
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 👉 REDIRECIONA (SEM FAZER MAIS NADA)
      navigate("/home", { replace: true });

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
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-700 flex items-center justify-center p-6 text-white font-display">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-sm border border-green-400/30">

        <div className="text-center mb-5">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="w-24 mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-yellow-300">
            Entrar na sua conta
          </h1>
          <p className="text-sm text-blue-100">
            Aposte e acompanhe seus resultados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-300 outline-none"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label className="text-sm">Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/10 text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-300 outline-none"
                placeholder="Digite sua senha"
              />
              <span
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="material-symbols-outlined absolute right-4 top-3 cursor-pointer text-yellow-300"
              >
                {mostrarSenha ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>

          {erro && (
            <p className="text-yellow-300 text-sm text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-3 rounded-full shadow-lg transition-all mt-4"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p
            className="text-sm text-yellow-300 cursor-pointer text-right mt-2 hover:underline"
            onClick={() => navigate("/recuperar-senha")}
          >
            Esqueci minha senha
          </p>

          <p className="text-sm text-center mt-3">
            Não tem conta?{" "}
            <span
              onClick={() => navigate("/cadastro")}
              className="text-yellow-300 cursor-pointer hover:underline"
            >
              Cadastre-se
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}