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
            Última atualização: 26/01/2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            1. Controlador dos Dados
          </h2>
          <p>
            A plataforma ZLPIX-PREMIADO é operada por seu responsável legal,
            que atua como Controlador dos dados pessoais coletados, nos termos
            da Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD),
            sendo responsável pelas decisões referentes ao tratamento das
            informações dos usuários.
          </p>
          <p>
            Para solicitações relacionadas à privacidade e proteção de dados,
            o titular poderá entrar em contato por meio do canal oficial de
            atendimento disponibilizado na plataforma.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            2. Dados Pessoais Coletados
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nome completo</li>
            <li>E-mail</li>
            <li>Telefone</li>
            <li>Chave PIX para fins de pagamento ou recebimento</li>
            <li>Histórico de transações financeiras</li>
            <li>Bilhetes gerados e participação em sorteios</li>
            <li>Dados técnicos: endereço IP, navegador, dispositivo e logs de acesso</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            3. Finalidades do Tratamento
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Criação, autenticação e gerenciamento de conta</li>
            <li>Processamento de pagamentos via PIX</li>
            <li>Gestão de carteira digital interna</li>
            <li>Geração e controle de bilhetes e sorteios</li>
            <li>Envio de notificações operacionais</li>
            <li>Prevenção a fraudes e atividades ilícitas</li>
            <li>Cumprimento de obrigações legais e regulatórias</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            4. Bases Legais
          </h2>
          <p>
            O tratamento de dados pessoais ocorre com fundamento nas seguintes bases legais:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Execução de contrato ou de procedimentos preliminares</li>
            <li>Cumprimento de obrigação legal ou regulatória</li>
            <li>Legítimo interesse do controlador, respeitados os direitos do titular</li>
            <li>Consentimento do titular, quando aplicável</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            5. Compartilhamento de Dados
          </h2>
          <p>
            Os dados poderão ser compartilhados com:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provedores de pagamento e instituições financeiras</li>
            <li>Serviços de hospedagem, armazenamento em nuvem e infraestrutura</li>
            <li>Prestadores de serviços tecnológicos essenciais à operação</li>
            <li>Autoridades públicas, quando houver obrigação legal</li>
          </ul>
          <p>
            Não realizamos venda de dados pessoais.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            6. Armazenamento e Segurança
          </h2>
          <p>
            São adotadas medidas técnicas e organizacionais adequadas para proteção
            dos dados pessoais contra acessos não autorizados, vazamentos,
            perda, alteração ou destruição indevida.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            7. Retenção de Dados
          </h2>
          <p>
            Os dados pessoais são armazenados pelo período necessário ao
            cumprimento das finalidades descritas nesta política, respeitando
            prazos legais aplicáveis e obrigações regulatórias.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            8. Direitos do Titular
          </h2>
          <p>
            Nos termos da LGPD, o titular poderá exercer os seguintes direitos:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados</li>
            <li>Revogação do consentimento, quando aplicável</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            9. Cookies e Tecnologias
          </h2>
          <p>
            Poderão ser utilizados cookies e tecnologias semelhantes para
            autenticação, segurança, melhoria de desempenho e análise de uso
            da plataforma.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            10. Alterações na Política
          </h2>
          <p>
            Esta Política de Privacidade poderá ser atualizada a qualquer momento,
            sendo recomendada a consulta periódica desta página.
          </p>
        </section>

      </div>

      <NavBottom />
    </div>
  );
}