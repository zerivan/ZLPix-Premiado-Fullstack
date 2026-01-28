// backend/src/services/assistant-engine.ts

type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";

const FINANCIAL_RESPONSE = `Para sua segurança, situações relacionadas a pagamentos, prêmios, saques, créditos na carteira ou possíveis falhas no sistema são tratadas exclusivamente pela administração.

Envie um e-mail para ${SUPPORT_EMAIL} informando seu nome completo e descrevendo detalhadamente o ocorrido para que possamos verificar seu caso com prioridade.`;

const OUT_OF_SCOPE_RESPONSE = `Sou a assistente do ZLpix Premiado e posso ajudar com informações relacionadas ao funcionamento do aplicativo, apostas, bilhetes e sorteios.

Para outros assuntos, recomendo utilizar uma ferramenta de pesquisa específica. Se tiver dúvidas sobre o ZLpix, fico à disposição para ajudar.`;

export class AssistantEngine {
  private static sensitiveKeywords = [
    "saldo",
    "saque",
    "pix",
    "depósito",
    "deposito",
    "pagamento",
    "carteira",
    "valor",
    "credito",
    "crédito",
    "premio",
    "prêmio",
    "ganhei",
    "ganhador",
    "erro",
    "problema",
    "falha",
    "bug",
    "não caiu",
    "nao caiu",
    "não foi creditado",
    "nao foi creditado",
    "não recebi",
    "nao recebi",
    "não funcionou",
    "nao funcionou",
    "não gerou",
    "nao gerou",
    "não aparece",
    "nao aparece"
  ];

  private static institutionalKeywords = [
    "como funciona",
    "como jogar",
    "aposta",
    "bilhete",
    "sorteio",
    "resultado",
    "home",
    "carteira",
    "regras",
    "participar",
    "gerar dezenas",
    "valor do prêmio",
    "valor do premio"
  ];

  private static contactKeywords = [
    "contato",
    "falar com",
    "suporte",
    "atendimento",
    "email",
    "e-mail",
    "endereço",
    "link"
  ];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    // 1️⃣ Prioridade máxima: sensível / erro
    if (this.containsKeyword(normalized, this.sensitiveKeywords)) {
      return { reply: FINANCIAL_RESPONSE };
    }

    // 2️⃣ Pedido de contato
    if (this.containsKeyword(normalized, this.contactKeywords)) {
      return {
        reply: `Você pode entrar em contato com a administração pelo e-mail oficial: ${SUPPORT_EMAIL}`
      };
    }

    // 3️⃣ Perguntas institucionais
    if (this.containsKeyword(normalized, this.institutionalKeywords)) {
      return {
        reply:
          "Você pode encontrar todas as informações detalhadas dentro do próprio aplicativo. Caso queira, posso explicar como funciona a área específica que você deseja consultar."
      };
    }

    // 4️⃣ Fora de escopo
    return { reply: OUT_OF_SCOPE_RESPONSE };
  }

  private static containsKeyword(
    text: string,
    keywords: string[]
  ): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}