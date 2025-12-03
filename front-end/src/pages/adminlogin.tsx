// src/pages/adminlogin.tsx
import React, { useState } from "react";
import NavBottom from "../components/navbottom";

export default function AdminLogin() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // 🔒 Login fake temporário (depois conecta ao backend)
    setError("Usuário ou senha inválidos");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 font-display p-6 pb-20">
      {/* Logo */}
      <div className="w-full max-w-sm pb-6">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuKIsN5CuI7QlmI6JpDszqCHSDQdCDwsCJRj7a3fGfvGsFg75bDlW25nMLnDTcuWmMZzP7b9zcLA2nSuUyaW9uQuV6plq_YphFv8_O479zyoEZCL2rTF87HDSeWyezeBKcwG-XpqBw7dwZnP1BZLuLR56hVj--AdgddlV3_1q7Xf1kuzU0JUJUBHZspYsHvoMtKP2H_KazSGsJ9RqtQKAZ1GNjlUi3jD8g03-MAl_L-8B2IHfkU0VBWJMVOCIPcHKKhYS1YyOXBg"
          alt="Logo ZLPIX PREMIADO"
          className="mx-auto h-16 w-auto"
        />
      </div>

      {/* Título */}
      <h1 className="text-center text-3xl font-bold text-yellow-300 mb-6">
        Painel Administrativo
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-5 bg-white/10 p-6 rounded-2xl shadow-lg border border-yellow-400/20"
      >
        {/* Usuário */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-medium text-white">Usuário</span>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-yellow-300">
              person
            </span>
            <input
              type="text"
              placeholder="E-mail ou usuário"
              className="w-full h-14 pl-12 pr-4 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/10 focus:ring-2 focus:ring-yellow-300 outline-none"
            />
          </div>
        </label>

        {/* Senha */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-medium text-white">Senha</span>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-yellow-300">
              lock
            </span>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full h-14 pl-12 pr-12 rounded-lg bg-white/10 text-white placeholder-white/50 border border-white/10 focus:ring-2 focus:ring-yellow-300 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-0 h-full w-12 flex items-center justify-center text-yellow-300"
            >
              <span className="material-symbols-outlined">
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {/* Erro */}
        {error && (
          <p className="text-center text-sm text-red-400 font-medium">{error}</p>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="w-full h-14 rounded-full bg-yellow-400 text-blue-900 font-bold text-base shadow-lg hover:bg-yellow-500 transition"
        >
          Entrar
        </button>
      </form>

      {/* Rodapé fixo */}
      <NavBottom />
    </div>
  );
}