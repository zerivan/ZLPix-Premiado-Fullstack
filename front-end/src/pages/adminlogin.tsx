// src/pages/adminlogin.tsx
import React, { useState } from "react";

export default function AdminLogin() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Validação temporária — depois conecta ao backend
    setError("Usuário ou senha inválidos");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark font-display p-6">

      {/* Logo */}
      <div className="w-full max-w-sm pb-6">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuKIsN5CuI7QlmI6JpDszqCHSDQdCDwsCJRj7a3fGfvGsFg75bDlW25nMLnDTcuWmMZzP7b9zcLA2nSuUyaW9uQuV6plq_YphFv8_O479zyoEZCL2rTF87HDSeWyezeBKcwG-XpqBw7dwZnP1BZLuLR56hVj--AdgddlV3_1q7Xf1kuzU0JUJUBHZspYsHvoMtKP2H_KazSGsJ9RqtQKAZ1GNjlUi3jD8g03-MAl_L-8B2IHfkU0VBWJMVOCIPcHKKhYS1YyOXBg"
          alt="Logo ZLPIX PREMIADO"
          className="mx-auto h-16 w-auto"
        />
      </div>

      {/* Título */}
      <h1 className="text-center text-3xl font-bold text-slate-900 dark:text-white mb-6">
        Acesso Administrativo
      </h1>

      {/* Form */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-5"
      >
        {/* Usuário */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-medium text-slate-800 dark:text-white">
            Usuário
          </span>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-primary/70">
              person
            </span>

            <input
              type="text"
              placeholder="E-mail ou usuário"
              className="w-full h-14 pl-12 pr-4 rounded-lg bg-white/10 dark:bg-slate-800 text-white placeholder-white/50 border border-white/10 focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </div>
        </label>

        {/* Senha */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-medium text-slate-800 dark:text-white">
            Senha
          </span>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-primary/70">
              lock
            </span>

            <input
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full h-14 pl-12 pr-12 rounded-lg bg-white/10 dark:bg-slate-800 text-white placeholder-white/50 border border-white/10 focus:ring-2 focus:ring-primary/50 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-0 h-full w-12 flex items-center justify-center text-primary/70 hover:text-white"
            >
              <span className="material-symbols-outlined">
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {/* Erro */}
        {error && (
          <p className="text-center text-sm text-red-400 font-medium">
            {error}
          </p>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base shadow-lg shadow-primary/30 hover:bg-primary/90 transition"
        >
          Entrar
        </button>
      </form>

      {/* Suporte */}
      <div className="w-full max-w-sm text-center mt-8">
        <button className="text-sm font-medium text-white/70 hover:text-white">
          Problemas para acessar?
        </button>
      </div>
    </div>
  );
}