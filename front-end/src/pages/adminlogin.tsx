import React, { useState } from "react";

export default function adminlogin() {
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // 🔒 Validação temporária — conecta ao backend depois
    setError("Usuário ou senha inválidos");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 font-display p-6 text-white">
      {/* Logo */}
      <div className="w-full max-w-sm pb-6">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkuKIsN5CuI7QlmI6JpDszqCHSDQdCDwsCJRj7a3fGfvGsFg75bDlW25nMLnDTcuWmMZzP7b9zcLA2nSuUyaW9uQuV6plq_YphFv8_O479zyoEZCL2rTF87HDSeWyezeBKcwG-XpqBw7dwZnP1BZLuLR56hVj--AdgddlV3_1q7Xf1kuzU0JUJUBHZspYsHvoMtKP2H_KazSGsJ9RqtQKAZ1GNjlUi3jD8g03-MAl_L-8B2IHfkU0VBWJMVOCIPcHKKhYS1YyOXBg"
          alt="Logo ZLPIX PREMIADO"
          className="mx-auto h-16 w-auto drop-shadow-md"
        />
      </div>

      {/* Título */}
      <h1 className="text-center text-3xl font-bold text-yellow-300 mb-6 drop-shadow-md">
        Acesso Administrativo
      </h1>

      {/* Formulário */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-5 bg-blue-950/50 rounded-2xl p-6 border border-blue-700 shadow-xl"
      >
        {/* Usuário */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-semibold text-yellow-300">
            Usuário
          </span>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-yellow-400/80">
              person
            </span>

            <input
              type="text"
              placeholder="E-mail ou usuário"
              className="w-full h-14 pl-12 pr-4 rounded-lg bg-white/10 text-white placeholder-white/50 border border-yellow-400/20 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>
        </label>

        {/* Senha */}
        <label className="flex flex-col gap-2">
          <span className="text-base font-semibold text-yellow-300">
            Senha
          </span>

          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-4 text-yellow-400/80">
              lock
            </span>

            <input
              type={showPass ? "text" : "password"}
              placeholder="Digite sua senha"
              className="w-full h-14 pl-12 pr-12 rounded-lg bg-white/10 text-white placeholder-white/50 border border-yellow-400/20 focus:ring-2 focus:ring-yellow-400 outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-0 h-full w-12 flex items-center justify-center text-yellow-400/80 hover:text-yellow-300"
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
          className="w-full h-14 rounded-full bg-yellow-400 text-blue-900 font-bold text-base shadow-md hover:bg-yellow-300 transition"
        >
          Entrar
        </button>
      </form>

      {/* Suporte */}
      <div className="w-full max-w-sm text-center mt-6">
        <button className="text-sm font-medium text-yellow-200 hover:text-white transition">
          Problemas para acessar?
        </button>
      </div>
    </div>
  );
}