// backend/src/services/assistant-engine.ts

type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";

export class AssistantEngine {
  private static financialKeywords = [
    "saldo",
    "saque",
    "pix",
    "depósito",
    "deposito",
    "pagamento",
    "não caiu",
    "nao caiu",
    "carteira",
    "reembolso",
    "estorno",
    "valor caiu"
  ];

  private static resultKeywords = [
    "resultado",
    "ganhei",
    "fui premiado",
    "premiado",
    "meus bilhetes",
    "ver bilhete",
    "bilhetes"
  ];

  private static institutionalKeywords = [
    "como funciona",
    "regras",
    "horário",
    "horario",
    "sorteio",
    "premiação",
    "premiacao",
    "valor",
    "participar"
  ];

  private static contactKeywords = [
    "contato",
    "falar com",
    "suporte",
    "atendimento",
    "email",
    "e-mail",
    "whatsapp",
    "endereço",
    "link"
  ];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    // 1️⃣ Contato / Suporte
    if (this.containsKeyword(normalized, this.contactKeywords)) {
      return {
        reply: `Para entrar em contato com a administração, envie um e-mail para ${SUPPORT_EMAIL}`
      };
    }

    // 2️⃣ Bloqueio financeiro
    if (this.containsKeyword(normalized, this.financialKeywords)) {
      return {
        reply:
          `Para questões relacionadas a saldo, pagamentos ou movimentações financeiras, envie um e-mail para ${SUPPORT_EMAIL}`
      };
    }

    // 3️⃣ Resultado (informativo)
    if (this.containsKeyword(normalized, this.resultKeywords)) {
      return {
        reply:
          "Para consultar seus bilhetes e resultados do sorteio, acesse a área de bilhetes no painel do usuário."
      };
    }

    // 4️⃣ Perguntas institucionais
    if (this.containsKeyword(normalized, this.institutionalKeywords)) {
      return {
        reply:
          "O ZLpix Premiado funciona através da compra de bilhetes para participação em sorteios. Após a confirmação do pagamento, seu bilhete participa automaticamente do próximo sorteio. Fique atento às regras e datas divulgadas na plataforma."
      };
    }

    // 5️⃣ Fallback
    return {
      reply:
        `Não entendi sua dúvida. Se preferir, envie um e-mail para ${SUPPORT_EMAIL}`
    };
  }

  private static containsKeyword(
    text: string,
    keywords: string[]
  ): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}