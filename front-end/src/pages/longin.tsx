import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen w-full flex items-center justify-center p-4 font-display">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Logo */}
        <div className="flex justify-center w-full">
          <div className="w-48 h-auto">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
              alt="Logo ZLPix Premiado"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold">
            Bem-vindo de volta!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Faça seu login para continuar
          </p>
        </div>

        {/* Form */}
        <div className="flex w-full flex-col gap-4">

          {/* E-mail */}
          <div className="flex flex-col w-full">
            <label className="text-slate-700 dark:text-slate-200 text-sm font-medium pb-2">
              E-mail
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                mail
              </span>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                className="w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
                pl-12 pr-4 focus:border-primary focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col w-full">
            <label className="text-slate-700 dark:text-slate-200 text-sm font-medium pb-2">
              Senha
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                lock
              </span>
              <input
                type="password"
                placeholder="Sua senha"
                className="w-full h-14 rounded-lg border border-slate-300 dark:border-slate-700
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
                pl-12 pr-4 focus:border-primary focus:ring-primary"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-300 dark:border-slate-600
                bg-slate-50 dark:bg-slate-800 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Lembrar-me
              </span>
            </label>

            <a className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary">
              Esqueci a senha
            </a>
          </div>

          {/* Botão Login */}
          <button
            onClick={() => navigate("/home")}
            className="h-14 w-full rounded-lg bg-primary text-slate-900
            font-bold text-base active:scale-95"
          >
            Entrar
          </button>
        </div>

        {/* Link Cadastro */}
        <div className="text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Não tem uma conta?
            <span
              onClick={() => navigate("/register")}
              className="font-bold text-primary ml-1 hover:underline cursor-pointer"
            >
              Cadastre-se agora
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}