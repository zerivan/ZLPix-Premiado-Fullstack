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

  // 🔥 ANALISADOR DE SENHA
  function analisarSenha(password: string) {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }

  const regras = analisarSenha(password);

  function calcularForca() {
    let score = 0;
    if (regras.length) score++;
    if (regras.upper) score++;
    if (regras.lower) score++;
    if (regras.number) score++;
    if (regras.special) score++;
    return score;
  }

  const forca = calcularForca();

  function corForca() {
    if (forca <= 2) return "#ef4444";
    if (forca <= 4) return "#facc15";
    return "#22c55e";
  }

  function larguraForca() {
    return `${(forca / 5) * 100}%`;
  }

  function validarSenha(password: string, email?: string) {
    if (!password || password.length < 8) {
      return "A senha deve ter no mínimo 8 caracteres.";
    }
    if (email && password.toLowerCase() === email.toLowerCase()) {
      return "A senha não pode ser igual ao e-mail.";
    }
    if (!/[A-Z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula.";
    }
    if (!/[a-z]/.test(password)) {
      return "A senha deve conter pelo menos uma letra minúscula.";
    }
    if (!/[0-9]/.test(password)) {
      return "A senha deve conter pelo menos um número.";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "A senha deve conter pelo menos um caractere especial.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPass) {
      alert("As senhas não coincidem!");
      return;
    }

    // 🔥 CORREÇÃO: CAMPOS OBRIGATÓRIOS
    if (!fullName || !email || !phone || !pixKey || !password) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const erroSenha = validarSenha(password, email);
    if (erroSenha) {
      alert(erroSenha);
      return;
    }

    try {
      setLoading(true);

      localStorage.removeItem("TOKEN_ZLPIX");
      localStorage.removeItem("USER_ZLPIX");
      localStorage.removeItem("USER_ID");
      localStorage.removeItem("TOKEN_ZLPIX_ADMIN");
      localStorage.removeItem("ZLPIX_ADMIN_AUTH");

      const response = await api.post("/auth/register", {
        name: fullName,
        email,
        phone,
        pixKey,
        password,
        createdAt: new Date().toISOString(),
      });

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

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">

            <input
              className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3"
              placeholder="Nome completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="email"
              className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="tel"
              className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3"
              placeholder="Chave Pix"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />

            {/* SENHA */}
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 w-full"
                placeholder="Crie uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPass(!showPass)}
                className="material-symbols-outlined absolute right-4 top-3 text-yellow-400 cursor-pointer"
              >
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </div>

            {/* BARRA */}
            <div style={{ height: 6, background: "#333", borderRadius: 6 }}>
              <div
                style={{
                  height: "100%",
                  width: larguraForca(),
                  background: corForca(),
                }}
              />
            </div>

            {/* TEXTO */}
            <div style={{ fontSize: 12 }}>
              <div style={{ color: regras.length ? "#4ade80" : "#f87171" }}>• mínimo 8 caracteres</div>
              <div style={{ color: regras.upper ? "#4ade80" : "#f87171" }}>• letra maiúscula</div>
              <div style={{ color: regras.lower ? "#4ade80" : "#f87171" }}>• letra minúscula</div>
              <div style={{ color: regras.number ? "#4ade80" : "#f87171" }}>• número</div>
              <div style={{ color: regras.special ? "#4ade80" : "#f87171" }}>• caractere especial</div>
            </div>

            {/* CONFIRMAR */}
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                className="bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 w-full"
                placeholder="Repita sua senha"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              <span
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="material-symbols-outlined absolute right-4 top-3 text-yellow-400 cursor-pointer"
              >
                {showConfirmPass ? "visibility_off" : "visibility"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-blue-900 font-bold rounded-full py-3 mt-2"
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>

            <p className="text-center text-sm text-white/80 mt-2">
              Já tem conta?{" "}
              <span
                className="text-yellow-300 cursor-pointer"
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
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full bg-yellow-400 text-blue-900 font-bold rounded-full py-3"
            >
              Ir para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}