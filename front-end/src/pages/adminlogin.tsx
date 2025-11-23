// src/pages/adminlogin.tsx
import React, { useState } from "react";

export default function AdminLogin() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Exemplo de validação
    setError("Usuário ou senha inválidos");
  }

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center font-display p-4">
      
      {/* Logo */}
      <div className="w-full max-w-sm pb-8 pt-6">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuKIsN5CuI7QlmI6JpDszqCHSDQdCDwsCJRj7a3fGfvGsFg75bDlW25nMLnDTcuWmMZzP7b9zcLA2nSuUyaW9uQuV6plq_YphFv8_O479zyoEZCL2rTF87HDSeWyezeBKcwG-XpqBw7dwZnP1BZLuLR56hVj--AdgddlV3_1q7Xf1kuzU0JUJUBHZspYsHvoMtKP2H_KazSGsJ9RqtQKAZ1GNjlUi3jD8g03-MAl_L-8B2IHfkU0VBWJMVOCIPcHKKhYS1YyOXBg"
          alt="Logotipo ZLPIX PREMIADO"
          className="mx-auto h-16 w-auto"
        />
      </div>

      {/* Título */}
      <h1 className="text-white text-center text-[32px] font-bold pb-8">Acesso Administrativo</h1>

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4"
      >
        {/* Usuário */}
        <label className="flex flex-col w-full">
          <p className="text-white text-base font-medium pb-2">Usuário</p>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-[#c99294]">
              person
            </span>

            <input
              type="text"
              placeholder="Digite seu usuário ou e-mail"
              className="w-full bg-[#482325] text-white placeholder-[#c99294] border-none rounded-lg py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </label>

        {/* Senha */}
        <label className="flex flex-col w-full">
          <p className="text-white text-base font-medium pb-2">Senha</p>
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-[#c99294]">
              lock
            </span>

            <input
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full bg-[#482325] text-white placeholder-[#c99294] border-none rounded-lg py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/50"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-0 w-12 h-full flex items-center justify-center text-[#c99294] hover:text-white"
            >
              <span className="material-symbols-outlined">
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {/* Erro */}
        {error && (
          <p className="text-primary text-sm text-center">{error}</p>
        )}

        {/* Botão */}
        <button
          type="submit"
          className="w-full h-14 rounded-lg bg-primary text-white font-bold text-base shadow-md hover:bg-primary/90"
        >
          Entrar
        </button>
      </form>

      {/* Suporte */}
      <div className="w-full max-w-sm pt-8 text-center">
        <a href="#" className="text-sm font-medium text-white/70 hover:text-white">
          Problemas para acessar?
        </a>
      </div>
    </div>
  );
}
