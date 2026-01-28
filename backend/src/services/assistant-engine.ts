// backend/src/services/assistant-engine.ts

type AssistantResponse = {
  reply: string;
};

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
    "bilhete"
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

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    // 1️⃣ Bloqueio financeiro
    if (this.containsKeyword(normalized, this.financialKeywords)) {
      return {
        reply:
          "Para questões relacionadas a saldo, pagamentos ou movimentações financeiras, entre em contato com a administração pelo suporte oficial."
      };
    }

    // 2️⃣ Resultado (placeholder - integração futura com serviço real)
    if (this.containsKeyword(normalized, this.resultKeywords)) {
      return {
        reply:
          "Para consultar seus bilhetes e resultados do sorteio, acesse a área de bilhetes no painel do usuário."
      };
    }

    // 3️⃣ Perguntas institucionais
    if (this.containsKeyword(normalized, this.institutionalKeywords)) {
      return {
        reply:
          "O ZLpix Premiado funciona através da compra de bilhetes para participação em sorteios. Após a confirmação do pagamento, seu bilhete participa automaticamente do próximo sorteio. Fique atento às regras e datas divulgadas na plataforma."
      };
    }

    // 4️⃣ Fallback
    return {
      reply:
        "Não entendi sua dúvida. Pode reformular sua pergunta?"
    };
  }

  private static containsKeyword(
    text: string,
    keywords: string[]
  ): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}