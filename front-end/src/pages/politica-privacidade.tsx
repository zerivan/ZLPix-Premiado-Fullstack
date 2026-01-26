// src/pages/politica-privacidade.tsx
import React from "react";
import NavBottom from "../components/navbottom";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-yellow-300">
            Política de Privacidade
          </h1>
          <p className="text-sm text-white/70">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </header>

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
          <p>
            Os dados são utilizados para:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Criação e gerenciamento de conta</li>
            <li>Processamento de pagamentos via PIX</li>
            <li>Geração de bilhetes e controle de sorteios</li>
            <li>Envio de notificações</li>
            <li>Prevenção a fraudes</li>
            <li>Cumprimento de obrigações legais</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            4. Base Legal
          </h2>
          <p>
            O tratamento de dados é realizado com fundamento:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>No consentimento do titular</li>
            <li>No cumprimento de obrigação legal</li>
            <li>Na execução de contrato</li>
            <li>No legítimo interesse do controlador</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            5. Compartilhamento de Dados
          </h2>
          <p>
            Os dados podem ser compartilhados com:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provedores de pagamento</li>
            <li>Serviços de hospedagem e infraestrutura</li>
            <li>Autoridades legais, quando exigido</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            6. Armazenamento e Segurança
          </h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger os
            dados contra acessos não autorizados, vazamentos, alteração ou
            destruição indevida.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            7. Retenção de Dados
          </h2>
          <p>
            Os dados são mantidos pelo período necessário para cumprimento
            das finalidades descritas ou conforme exigido por lei.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            8. Direitos do Titular
          </h2>
          <p>
            O usuário pode solicitar:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos</li>
            <li>Exclusão de dados (quando aplicável)</li>
            <li>Revogação de consentimento</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            9. Cookies e Tecnologias
          </h2>
          <p>
            Podemos utilizar cookies e tecnologias semelhantes para
            melhorar a experiência do usuário e garantir o funcionamento
            adequado da plataforma.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            10. Alterações na Política
          </h2>
          <p>
            Esta política poderá ser atualizada a qualquer momento.
            Recomendamos a revisão periódica desta página.
          </p>
        </section>

      </div>

      <NavBottom />
    </div>
  );
}