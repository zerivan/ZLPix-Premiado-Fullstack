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

      <header className="relative text-center py-7 border-b border-white/10 shadow-md">
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 bg-white/10 px-4 py-2 rounded-full text-sm"
        >
          ← Voltar
        </button>

        <h1 className="text-3xl font-extrabold text-yellow-300">
          Política de Privacidade
        </h1>

        <p className="text-sm text-white/70 mt-6">
          Última atualização: 26/01/2026
        </p>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8 text-sm leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            1. Controlador dos Dados
          </h2>
          <p>
            Esta plataforma atua como Controladora dos dados pessoais
            coletados, nos termos da Lei nº 13.709/2018 (Lei Geral de
            Proteção de Dados – LGPD).
          </p>
        </section>

        <section className="space-y-3">
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

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            3. Finalidade do Tratamento
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Criação e gerenciamento de conta</li>
            <li>Processamento de pagamentos via PIX</li>
            <li>Geração de bilhetes e controle de sorteios</li>
            <li>Envio de notificações</li>
            <li>Prevenção a fraudes</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            4. Base Legal
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Consentimento do titular</li>
            <li>Cumprimento de obrigação legal</li>
            <li>Execução de contrato</li>
            <li>Legítimo interesse</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            5. Compartilhamento
          </h2>
          <p>
            Os dados podem ser compartilhados com provedores de pagamento,
            serviços de hospedagem e autoridades legais quando exigido.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            6. Segurança
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger os
            dados contra acessos não autorizados ou vazamentos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            7. Direitos do Titular
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Acesso aos dados</li>
            <li>Correção</li>
            <li>Exclusão quando aplicável</li>
            <li>Revogação de consentimento</li>
          </ul>
        </section>

      </main>

      <NavBottom />
    </div>
  );
}