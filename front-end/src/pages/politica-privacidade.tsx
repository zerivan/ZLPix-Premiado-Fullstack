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

      <header className="relative text-center pt-16 pb-7 border-b border-white/10 shadow-md">
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
            A plataforma ZLPix Premiado atua como Controladora dos dados
            pessoais tratados durante a utilização dos seus serviços, nos
            termos da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados
            Pessoais – LGPD). A plataforma disponibiliza Participações
            Digitais e seus serviços são destinados exclusivamente a usuários
            maiores de 18 anos.
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
            <li>Histórico de transações e movimentações</li>
            <li>Dados relacionados às Participações Digitais adquiridas pelo usuário</li>
            <li>Dados técnicos do dispositivo</li>
            <li>Endereço IP, navegador e sistema operacional</li>
            <li>Token de notificações push, quando autorizado pelo usuário</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            3. Finalidade do Tratamento
          </h2>

          <ul className="list-disc pl-6 space-y-1">
            <li>Criação e gerenciamento da conta do usuário</li>
            <li>Processamento de pagamentos realizados pela plataforma</li>
            <li>Registro e gerenciamento das Participações Digitais</li>
            <li>Processamento, auditoria e registro das apurações realizadas</li>
            <li>Crédito e movimentação da carteira virtual</li>
            <li>Envio de notificações operacionais, informativas e de segurança</li>
            <li>Prevenção a fraudes, abusos e acessos não autorizados</li>
            <li>Cumprimento de obrigações legais e regulatórias</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            4. Base Legal
          </h2>

          <ul className="list-disc pl-6 space-y-1">
            <li>Consentimento do titular</li>
            <li>Execução de contrato</li>
            <li>Cumprimento de obrigação legal ou regulatória</li>
            <li>Exercício regular de direitos</li>
            <li>Legítimo interesse da plataforma</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            5. Compartilhamento de Dados
          </h2>

          <p>
            Os dados poderão ser compartilhados, quando necessário, com
            instituições financeiras, provedores de pagamento, serviços de
            hospedagem, parceiros tecnológicos, prestadores de serviços
            essenciais ao funcionamento da plataforma e autoridades públicas,
            sempre em conformidade com a legislação aplicável.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            6. Segurança das Informações
          </h2>

          <p>
            A plataforma adota medidas técnicas, administrativas e
            organizacionais destinadas à proteção dos dados pessoais contra
            acesso não autorizado, alteração, divulgação, perda, destruição
            ou qualquer forma de tratamento inadequado, observando as boas
            práticas de segurança da informação.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            7. Notificações e Comunicações
          </h2>

          <p>
            A plataforma poderá enviar comunicações relacionadas às
            Participações Digitais, pagamentos, resultados das apurações,
            movimentações financeiras, segurança da conta e demais
            informações necessárias ao funcionamento dos serviços.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            8. Retenção dos Dados
          </h2>

          <p>
            Os dados pessoais serão armazenados pelo período necessário ao
            cumprimento das finalidades descritas nesta Política de
            Privacidade, observadas as exigências legais, regulatórias,
            fiscais, contábeis e de prevenção à fraude.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            9. Direitos do Titular
          </h2>

          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados pessoais</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação quando aplicável</li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados nos casos previstos em lei</li>
            <li>Revogação do consentimento, quando aplicável</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-300">
            10. Contato
          </h2>

          <p>
            Solicitações relacionadas à privacidade, proteção de dados ou ao
            exercício dos direitos previstos na Lei Geral de Proteção de
            Dados Pessoais (LGPD) poderão ser encaminhadas pelos canais
            oficiais de atendimento da plataforma ou pelo e-mail:
            <br />
            <strong>zlpixpremiado.suporte@gmail.com</strong>
          </p>
        </section>

      </main>

      <NavBottom />
    </div>
  );
}