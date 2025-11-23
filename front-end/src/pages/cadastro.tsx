// src/pages/cadastro.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Cadastro() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui apenas mostramos no console — depois a gente conecta ao backend
    console.log({
      fullName,
      email,
      phone,
      pixKey,
      password,
    });
    alert("Dados prontos no console (verifique).");
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Cabeçalho */}
        <div className="mb-6 flex justify-center">
          <div
            className="w-32 h-32 bg-center bg-no-repeat bg-contain"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDTZzkw-GFsW5OG_1HRkUbJaNvj8085dtqDKfHAjJhf5i3dudYG_QmuAro-RwrcRcTtO-0xI4ISUWI7GReI0AmdTlkkChtPxMOnj8nemgp_KhuxmOKh6WUlS3uXF8945-MKoWtADiXhFBC1Qa9PgwauBr9-w7WTrcSxw1VizIyyJeqQVJuqDbIBpKSCksbUFCQ4GNkWTTXyRH0Pe4U7KRWsBACeylTc7OtQElx_7y0nQzFYw0npXLFqHgIqCPXNnVfak4YCnujPcqI")',
            }}
            aria-hidden
          />
        </div>

        <h1 className="text-text-dark dark:text-white text-3xl font-bold leading-tight text-center mb-4">
          Crie sua Conta
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {/* Nome Completo */}
          <label className="flex flex-col">
            <p className="text-text-dark dark:text-text-dark text-sm font-medium pb-2">Nome Completo</p>
            <div className="flex w-full items-stretch rounded-lg">
              <div className="text-text-dark-muted flex border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">person</span>
              </div>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light dark:text-white focus:outline-0 focus:ring-2 focus:ring-brand-green/50 border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-brand-green/80 h-14 placeholder:text-text-dark-muted p-4 text-base"
                type="text"
                name="fullName"
                autoComplete="name"
              />
            </div>
          </label>

          {/* E-mail */}
          <label className="flex flex-col">
            <p className="text-text-light dark:text-text-dark text-sm font-medium pb-2">E-mail</p>
            <div className="flex w-full items-stretch rounded-lg">
              <div className="text-text-dark-muted flex border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">mail</span>
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light dark:text-white focus:outline-0 focus:ring-2 focus:ring-brand-green/50 border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-brand-green/80 h-14 placeholder:text-text-dark-muted p-4 text-base"
                type="email"
                name="email"
                autoComplete="email"
              />
            </div>
          </label>

          {/* Telefone */}
          <label className="flex flex-col">
            <p className="text-text-light dark:text-text-dark text-sm font-medium pb-2">Telefone</p>
            <div className="flex w-full items-stretch rounded-lg">
              <div className="text-text-dark-muted flex border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">call</span>
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 90000-0000"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light dark:text-white focus:outline-0 focus:ring-2 focus:ring-brand-green/50 border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-brand-green/80 h-14 placeholder:text-text-dark-muted p-4 text-base"
                type="tel"
                name="phone"
                autoComplete="tel"
              />
            </div>
          </label>

          {/* Chave Pix */}
          <label className="flex flex-col">
            <p className="text-text-light dark:text-text-dark text-sm font-medium pb-2">Chave Pix</p>
            <div className="flex w-full items-stretch rounded-lg">
              <div className="text-text-dark-muted flex border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
              <input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Sua Chave Pix"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-light dark:text-white focus:outline-0 focus:ring-2 focus:ring-brand-green/50 border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-brand-green/80 h-14 placeholder:text-text-dark-muted p-4 text-base"
                type="text"
                name="pixKey"
                autoComplete="off"
              />
            </div>
          </label>

          {/* Senha */}
          <label className="flex flex-col relative">
            <p className="text-text-light dark:text-text-dark text-sm font-medium pb-2">Senha</p>
            <div className="flex w-full items-stretch rounded-lg relative">
              <div className="text-text-dark-muted flex border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined">key</span>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha forte"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-text-light dark:text-white focus:outline-0 focus:ring-2 focus:ring-brand-green/50 border border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark focus:border-brand-green/80 h-14 placeholder:text-text-dark-muted p-4 pr-12 text-base"
                type="password"
                name="password"
                autoComplete="new-password"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dark-muted cursor-pointer">
                <span className="material-symbols-outlined">visibility</span>
              </div>
            </div>
          </label>

          <div>
            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center gap-x-2 rounded-lg bg-brand-green px-6 text-base font-bold text-white shadow-lg transition-transform duration-200 ease-in-out hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-brand-green/50"
            >
              Criar Conta
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                className="form-checkbox h-5 w-5 rounded border-gray-300 dark:border-border-dark bg-background-light dark:bg-surface-dark text-brand-green focus:ring-brand-green/50"
                type="checkbox"
              />
              <span className="text-sm text-text-light dark:text-text-dark">Lembrar-me</span>
            </label>
            <Link to="#" className="text-sm font-medium text-brand-green hover:underline">
              Esqueci a senha
            </Link>
          </div>

          <p className="text-xs text-text-light/60 dark:text-text-dark-muted text-center pt-6">
            Ao continuar, você concorda com nossos{" "}
            <Link to="#" className="text-xs font-medium text-brand-green hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link to="#" className="text-xs font-medium text-brand-green hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}