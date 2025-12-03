import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Cadastro() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("As senhas não coincidem!");
      return;
    }

    if (!fullName || !email || !password) {
      alert("Preencha nome, e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      // 🟢 Envia dados de cadastro com createdAt
      const response = await api.post("/auth/register", {
        name: fullName,
        email,
        phone,
        pixKey,
        password,
        createdAt: new Date().toISOString(), // ✅ salva data no formato ISO
      });

      // 🟢 Salva dados do usuário localmente (para o perfil carregar)
      const user = response.data?.user || {
        name: fullName,
        email,
        phone,
        pixKey,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("USER_ZLPIX", JSON.stringify(user));

      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Erro ao criar conta. Tente novamente.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 flex items-center justify-center p-5 font-display">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/10">
        {/* Cabeçalho */}
        <div className="text-center mb-5">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmzrE-Lxoj0vhBEQ06zXmsjgkqYG5YBlM1M9_v6HQ4R4pBfd3yVEEpnp5XPqZRHsJ6dWz1JuQc02890lsQdUljWDlvoMImtzkLgrs2rfv3QL-NrsYiDAzqkXhSdT8rRM9Qu4lphwOalWJNxxBix-212vwFBaU03M53Jrbx14xLnkofjbeXCG_e18RNUcOeh3Cl6sQoV0aDgBHDCX3qM0OG6PFoATVuZ5ban3RA7_evH4W8Qm3m3rKyvSn-shgPw2K9K306pNEzHak"
            alt="Logo ZLPix"
            className="mx-auto h-16"
          />
          <h1 className="text-2xl font-bold text-yellow-300 mt-3">
            Crie sua conta
          </h1>
          <p className="text-sm text-white/80">É rápido e seguro ✨</p>
        </div>

        {/* Formulário */}
        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="email"
              className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="tel"
              className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Chave Pix (opcional)"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />

            {/* Senha */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPass(!showPass)}
                className="material-symbols-outlined absolute right-4 top-3 text-yellow-400 cursor-pointer select-none"
              >
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                className="bg-white/10 text-white placeholder-white/60 border border-white/20 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Repita sua senha"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <span
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="material-symbols-outlined absolute right-4 top-3 text-yellow-400 cursor-pointer select-none"
              >
                {showConfirmPass ? "visibility_off" : "visibility"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-blue-900 font-bold rounded-full py-3 mt-2 hover:bg-yellow-500 transition shadow-lg"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>

            <p className="text-center text-sm text-white/80 mt-2">
              Já tem conta?{" "}
              <span
                className="text-yellow-300 font-semibold cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Entrar
              </span>
            </p>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-yellow-300 mb-3">
              🎉 Conta criada com sucesso!
            </h2>
            <p className="text-white/80 text-sm mb-4">
              Agora faça login para acessar sua conta.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-yellow-400 text-blue-900 font-bold rounded-full py-3 hover:bg-yellow-500 transition shadow-lg"
            >
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}