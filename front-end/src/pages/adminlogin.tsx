import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function adminlogin() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("Usuário ou senha inválidos");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 font-display p-6 text-white relative">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full text-sm text-yellow-300 hover:bg-white/20 transition"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Voltar
      </button>

      {/* Logo */}
      <div className="w-full max-w-sm pb-6 mt-8">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuKIsN5CuI7QlmI6JpDszqCHSDQdCDwsCJRj7a3fGfvGsFg75bDlW25nMLnDTcuWmMZzP7b9zcLA2nSuUyaW9uQuV6plq_YphFv8_O479zyoEZCL2rTF87HDSeWyezeBKcwG-XpqBw7dwZnP1BZLuLR56hVj--AdgddlV3_1q7Xf1kuzU0JUJUBHZspYsHvoMtKP2H_KazSGsJ9RqtQKAZ1GNjlUi3jD8g03-MAl_L-8B2IHfkU0VBWJMVOCIPcHKKhYS1YyOXBg"
          alt="Logo ZLPIX PREMIADO"
          className="mx-auto h-16 w-auto drop-shadow-md"
        />
      </div>

      <h1 className="text-center text-3xl font-bold text-yellow-300 mb-6 drop-shadow-md">
        Acesso Administrativo
      </h1>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-5 bg-blue-950/40 rounded-2xl p-6 border border-yellow-400/20 shadow-lg"
      >
        <label className="flex flex-col gap-2">
          <span className="font-semibold text-yellow-300">Usuário</span>
          <input
            type="text"
            placeholder="E-mail ou usuário"
            className="w-full h-12 px-4 rounded-lg bg-white/10 text-white border border-yellow-400/20 focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-semibold text-yellow-300">Senha</span>
          <div className="relative flex items-center">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full h-12 px-4 pr-12 rounded-lg bg-white/10 text-white border border-yellow-400/20 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 text-yellow-300/70 hover:text-yellow-300"
            >
              <span className="material-symbols-outlined">
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
        </label>

        {error && <p className="text-center text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full h-12 rounded-full bg-yellow-400 text-blue-900 font-bold hover:bg-yellow-300 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}