// src/pages/termos-de-uso.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function TermosDeUso() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">

      {/* HEADER PADRÃO */}
      <header className="relative text-center pt-16 pb-7 border-b border-white/10 shadow-md">
        <button
          onClick={handleBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition"
        >
          ← Voltar
        </button>

        <h1 className="text-2xl font-bold text-yellow-300">
          Termos de Uso
        </h1>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 space-y-8">

        <p className="text-sm text-white/70">
          Última atualização: 14/06/2026
        </p>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar e utilizar a plataforma ZLPix Premiado, o usuário declara
que leu, compreendeu e concorda integralmente com estes Termos de Uso
e com a Política de Privacidade.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            2. Idade Mínima
          </h2>
          <p>
            O uso da plataforma é permitido apenas para maiores de 18 anos.
            Ao se cadastrar, o usuário declara possuir idade mínima legal.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            3. Cadastro e Responsabilidade
          </h2>
          <p>
            O usuário é responsável pela veracidade das informações fornecidas
            no cadastro e pela segurança de suas credenciais de acesso.
          </p>
          <p>
            É proibida a criação de múltiplas contas com finalidade fraudulenta.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            3.1 Exclusão de Conta
          </h2>

          <p>
            O usuário poderá solicitar a exclusão de sua conta pelos canais
            oficiais de atendimento da plataforma.
          </p>

          <p>
            Determinados dados poderão permanecer armazenados pelo prazo exigido
            pela legislação aplicável, especialmente para fins fiscais,
            contábeis, prevenção a fraudes, segurança e cumprimento de
            obrigações legais.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
  <h2 className="text-lg font-semibold text-yellow-300">
    4. Funcionamento da Plataforma
  </h2>

  <p>
    A plataforma disponibiliza Participações Digitais, cuja apuração utiliza
    como referência os resultados oficiais da Loteria Federal, conforme o
    Regulamento da plataforma.
  </p>

  <p>
    A utilização dos resultados da Loteria Federal possui exclusivamente a
    finalidade de estabelecer um critério público, objetivo e verificável para
    as apurações, não existindo qualquer vínculo, patrocínio, administração ou
    responsabilidade da Caixa Econômica Federal sobre a plataforma.
  </p>

  <p>
    A plataforma observará, quando aplicável, a legislação brasileira vigente,
    incluindo a Lei nº 5.768/1971, o Decreto nº 70.951/1972 e demais normas
    relacionadas às promoções comerciais e à proteção do consumidor.
  </p>
</section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            5. Pagamentos e Carteira
          </h2>
          <p>
  Os pagamentos são realizados por meio dos métodos disponibilizados pela
  plataforma. Os créditos poderão ser utilizados para aquisição de
  Participações Digitais e demais funcionalidades disponíveis.
</p>
          <p>
            A utilização da carteira interna está sujeita às regras vigentes
            no momento da transação.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            6. Regras de Premiação
          </h2>
          <p>
  A distribuição dos prêmios seguirá o Regulamento vigente da plataforma,
  podendo ocorrer divisão entre participantes elegíveis, quando aplicável.
</p>

<p>
  Os valores dos prêmios serão creditados na carteira virtual do usuário,
  conforme as regras estabelecidas pela plataforma.
</p>

<p>
  A apuração utilizará como referência os resultados oficiais da Loteria
  Federal, conforme os critérios definidos no Regulamento da plataforma.
</p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            7. Condutas Proibidas
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fraudes ou tentativas de manipulação do sistema</li>
            <li>Uso de dados falsos</li>
            <li>Exploração de falhas técnicas</li>
          </ul>
          <p>
            A violação poderá resultar em bloqueio ou exclusão da conta.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            8. Limitação de Responsabilidade
          </h2>
          <p>
            A plataforma não se responsabiliza por falhas decorrentes de
            indisponibilidade de serviços de terceiros, instituições financeiras
            ou problemas de conexão do usuário.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            9. Alterações
          </h2>
          <p>
            Estes Termos poderão ser atualizados a qualquer momento,
            sendo recomendada a revisão periódica.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            10. Cancelamento e Reembolso
          </h2>
          <p>
            Os depósitos realizados via PIX são convertidos em créditos na
            carteira interna da plataforma.
          </p>
          <p>
  Após a confirmação do crédito na carteira, os valores não serão
  reembolsáveis quando já utilizados para aquisição de Participações
  Digitais ou demais funcionalidades disponibilizadas pela plataforma.
</p>
          <p>
            Solicitações de cancelamento antes da utilização dos créditos
            poderão ser analisadas individualmente mediante contato pelo
            canal oficial de atendimento.
          </p>
          <p>
            A plataforma poderá reter valores e bloquear contas em caso de
            suspeita de fraude, uso indevido ou violação destes Termos.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed">
          <h2 className="text-lg font-semibold text-yellow-300">
            11. Contato
          </h2>

          <p>
            Dúvidas, solicitações, reclamações ou comunicações relacionadas
            a estes Termos de Uso poderão ser encaminhadas através do canal
            oficial de atendimento da plataforma.
          </p>

          <p>
            <strong>zlpixpremiado.suporte@gmail.com</strong>
          </p>
        </section>

      </main>

      <NavBottom />
    </div>
  );
}