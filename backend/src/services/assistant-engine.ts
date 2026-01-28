// backend/src/services/assistant-engine.ts

type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";

const FINANCIAL_RESPONSE = `Para sua segurança, situações relacionadas a pagamentos, prêmios, saques, créditos na carteira ou possíveis falhas no sistema são tratadas exclusivamente pela administração.

Envie um e-mail para ${SUPPORT_EMAIL} informando seu nome completo e descrevendo detalhadamente o ocorrido para que possamos verificar seu caso com prioridade.`;

const OUT_OF_SCOPE_RESPONSE = `Sou a assistente do ZLpix Premiado e posso ajudar com informações relacionadas ao funcionamento do aplicativo, apostas, bilhetes e sorteios.

Se tiver dúvidas sobre a plataforma, fico à disposição para orientar.`;

export class AssistantEngine {

  private static sensitiveKeywords = [
    "saldo", "saque", "pix", "depósito", "deposito",
    "pagamento", "valor", "credito", "crédito",
    "premio", "prêmio", "ganhei", "ganhador",
    "erro", "problema", "falha", "bug",
    "não caiu", "nao caiu",
    "não foi creditado", "nao foi creditado",
    "não recebi", "nao recebi",
    "não funcionou", "nao funcionou",
    "não gerou", "nao gerou",
    "não aparece", "nao aparece"
  ];

  private static apostaKeywords = [
    "como jogar", "como apostar", "aposta", "dezenas", "gerar"
  ];

  private static resultadoKeywords = [
    "resultado", "sorteio", "numero sorteado", "número sorteado"
  ];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    // 🔒 Prioridade: Financeiro / Erro
    if (this.containsKeyword(normalized, this.sensitiveKeywords)) {
      return { reply: FINANCIAL_RESPONSE };
    }

    // 🎯 Módulo Apostas
    if (this.containsKeyword(normalized, this.apostaKeywords)) {
      return {
        reply: `Para participar, acesse a área de apostas na plataforma.

Você poderá selecionar até três dezenas manualmente ou utilizar o botão 'Gerar' para escolha automática. Após definir as dezenas, confirme sua aposta.

Em seguida, você será direcionado para a página de revisão, onde poderá conferir os números escolhidos. Caso queira alterar, é possível retornar e gerar novos bilhetes. Se estiver tudo correto, basta prosseguir com o pagamento.

Após a confirmação do pagamento, seu bilhete será gerado automaticamente e ficará disponível na área 'Meus Bilhetes'.

Se desejar, posso te orientar sobre a página 'Meus Bilhetes' ou sobre como funciona o sorteio.`
      };
    }

    // 🎉 Módulo Resultado
    if (this.containsKeyword(normalized, this.resultadoKeywords)) {
      return {
        reply: `Os sorteios são realizados com base no resultado da Loteria Federal.

A venda de bilhetes é encerrada às 17h da quarta-feira. Bilhetes adquiridos após esse horário passam a concorrer no próximo sorteio.

Você pode consultar o número sorteado e verificar se seu bilhete foi premiado na página 'Resultado' do aplicativo.

Se desejar, posso te orientar sobre como acompanhar seus bilhetes ou sobre a área de carteira.`
      };
    }

    return { reply: OUT_OF_SCOPE_RESPONSE };
  }

  private static containsKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}