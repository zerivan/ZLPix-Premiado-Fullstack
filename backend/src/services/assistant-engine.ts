type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";
const TICKET_PRICE = 2;

const FINANCIAL_RESPONSE = `Para sua segurança, assuntos relacionados a pagamentos, prêmios, saques, créditos na carteira ou possíveis falhas financeiras são tratados exclusivamente pela administração.

Envie um e-mail para ${SUPPORT_EMAIL} informando seu nome completo e descrevendo detalhadamente o ocorrido para que possamos verificar seu caso com prioridade.`;

const OUT_OF_SCOPE_RESPONSE = `Sou a assistente do ZLpix Premiado e posso orientar você sobre:

• Como apostar  
• Funcionamento dos bilhetes  
• Página de resultados  
• Carteira (saldo, saque e histórico)  
• Pagamento via Pix  
• Notificações e configurações  
• Recuperação de senha  
• Política de privacidade  

Se desejar, posso te orientar em alguma dessas áreas.`;

export class AssistantEngine {

  private static domains = {
    aposta: ["apostar", "aposta", "gerar", "dezenas"],
    bilhete: ["bilhete", "meus bilhetes", "download", "historico", "histórico"],
    resultado: ["resultado", "sorteio", "numero sorteado", "número sorteado"],
    carteira: ["carteira", "saldo", "sacar", "depositar", "extrato"],
    pix: ["pix", "pagamento"],
    notificacao: ["notificação", "notificacao", "avisos"],
    privacidade: ["privacidade", "contato", "suporte"],
    preco: ["preço", "valor", "quanto custa", "custa quanto"],
    senha: ["senha", "recuperar senha", "esqueci minha senha", "resetar senha"],
    saudacao: ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"],
    identidade: ["seu nome", "quem é você", "quem e voce"]
  };

  private static sensitiveKeywords = [
    "não caiu", "nao caiu",
    "não recebi", "nao recebi",
    "não foi creditado", "nao foi creditado",
    "erro", "falha", "bug"
  ];

  private static confirmations = ["sim", "quero", "pode", "ok", "claro", "isso"];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    if (this.containsKeyword(normalized, this.domains.saudacao)) {
      return {
        reply: `Olá! Eu sou a assistente do ZLpix Premiado.

Posso te ajudar com apostas, pagamentos, carteira, bilhetes ou resultados.

O que você gostaria de saber?`
      };
    }

    if (this.containsKeyword(normalized, this.domains.identidade)) {
      return {
        reply: `Sou a assistente virtual do ZLpix Premiado.

Estou aqui para te orientar sobre o funcionamento da plataforma de forma rápida e segura.

Como posso te ajudar?`
      };
    }

    if (this.confirmations.includes(normalized)) {
      return {
        reply: `Perfeito. Após o pagamento confirmado, você pode acessar seus bilhetes na página "Meus Bilhetes".

Lá você encontrará:
• As dezenas escolhidas  
• Status do bilhete  
• Data do sorteio  

Se algo não aparecer, aguarde alguns segundos e atualize a página.

Posso te ajudar com mais alguma coisa?`
      };
    }

    if (this.containsKeyword(normalized, this.sensitiveKeywords)) {
      return { reply: FINANCIAL_RESPONSE };
    }

    const intent = this.detectIntent(normalized);
    const domain = this.detectDomain(normalized);

    if (!domain) {
      if (this.isGeneralKnowledge(normalized)) {
        return {
          reply: `Essa pergunta não está relacionada ao funcionamento do ZLpix Premiado.

Para esse tipo de informação, recomendo consultar fontes confiáveis como Google, Wikipedia ou portais oficiais.

Posso ajudar você com algo dentro da plataforma?`
        };
      }

      return { reply: OUT_OF_SCOPE_RESPONSE };
    }

    const reply = this.buildResponse(intent, domain);
    return { reply };
  }

  private static detectIntent(text: string): string {
    if (text.startsWith("como")) return "how";
    if (text.includes("para que serve")) return "purpose";
    if (text.includes("o que acontece")) return "what_happens";
    if (text.includes("é seguro") || text.includes("seguro")) return "security";
    if (text.includes("quanto") || text.includes("valor") || text.includes("preço")) return "price";
    if (text.includes("quanto tempo")) return "duration";
    if (text.includes("onde")) return "location";
    return "info";
  }

  private static detectDomain(text: string): string | null {
    for (const [domain, keywords] of Object.entries(this.domains)) {
      if (this.containsKeyword(text, keywords)) {
        return domain;
      }
    }
    return null;
  }

  private static containsKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((k) => text.includes(k));
  }

  private static isGeneralKnowledge(text: string): boolean {
    return (
      text.includes("capital") ||
      text.includes("presidente") ||
      text.includes("história") ||
      text.includes("geografia") ||
      text.includes("matemática") ||
      text.includes("significado")
    );
  }

  private static buildResponse(intent: string, domain: string): string {

    if (domain === "senha") {
      return `Para recuperar sua senha, utilize a opção "Esqueci minha senha" na tela de login e siga as instruções enviadas para seu e-mail.`;
    }

    if (domain === "preco") {
      return `O bilhete custa R$ ${TICKET_PRICE.toFixed(2)}.`;
    }

    if (domain === "aposta") {
      return `Na página "Apostar", escolha até três dezenas e finalize o pagamento via Pix. Após aprovação, seu bilhete será gerado automaticamente.`;
    }

    if (domain === "bilhete") {
      return `Acesse "Meus Bilhetes" para visualizar suas dezenas, status e data do sorteio.`;
    }

    if (domain === "resultado") {
      return `Os resultados são baseados na Loteria Federal e exibidos na página "Resultados".`;
    }

    if (domain === "carteira") {
      return `A carteira permite depósitos via Pix, saques e consulta de saldo.`;
    }

    if (domain === "pix") {
      return `O pagamento via Pix é confirmado automaticamente. Após aprovação, o sistema libera seu bilhete ou saldo.`;
    }

    if (domain === "notificacao") {
      return `Ative notificações para receber avisos importantes do sistema.`;
    }

    if (domain === "privacidade") {
      return `Para suporte: ${SUPPORT_EMAIL}.`;
    }

    return OUT_OF_SCOPE_RESPONSE;
  }
}