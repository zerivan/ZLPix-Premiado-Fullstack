import React from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24 relative">

      {/* HEADER FIXO */}
      <header className="relative text-center py-7 border-b border-white/10 shadow-md">
        <button
          onClick={handleBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 px-4 py-2 rounded-full text-sm"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-extrabold text-yellow-300">
          Política de Privacidade
        </h1>

        <p className="text-sm text-white/70 mt-2">
          Última atualização: 26/01/2026
        </p>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8">

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            1. Controlador dos Dados
          </h2>
          <p>
            Esta plataforma atua como Controladora dos dados pessoais
            coletados, nos termos da Lei nº 13.709/2018 (Lei Geral de
            Proteção de Dados – LGPD).
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            2. Dados Coletados
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nome completo</li>
            <li>E-mail</li>
            <li>Telefone</li>
            <li>Chave PIX</li>
            <li>Histórico de transações</li>
            <li>Dados técnicos (IP, navegador, dispositivo)</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            3. Finalidade do Tratamento
          </h2>
          <ul className="