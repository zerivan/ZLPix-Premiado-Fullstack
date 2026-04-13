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
    senha: ["senha", "recuperar senha", "esqueci minha senha", "resetar senha"]
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

    // 🔥 NOVO: tratamento de confirmação
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
      if (intent === "how") {
        return `Para recuperar sua senha:

1. Acesse a tela de login  
2. Clique em "Esqueci minha senha"  
3. Informe seu e-mail cadastrado  
4. Verifique sua caixa de entrada (e também o spam)  
5. Clique no link recebido e defina uma nova senha  

Se o e-mail não chegar, aguarde alguns minutos e verifique a pasta de spam.

Se ainda tiver problema, posso te orientar melhor.`;
      }

      return `Se você esqueceu sua senha, utilize a opção "Esqueci minha senha" na tela de login.

Você receberá um link por e-mail para redefinição.

Caso não encontre, verifique também a caixa de spam.

Se algo não funcionar como esperado, me diga o que aconteceu.`;
    }

    if (domain === "preco" || intent === "price") {
      return `O bilhete custa R$ ${TICKET_PRICE.toFixed(2)}.

Deseja que eu te mostre como fazer uma aposta agora?`;
    }

    if (domain === "aposta") {
      return `Na página "Apostar", você pode escolher até três dezenas manualmente ou usar o botão "Gerar".

Depois é só confirmar e realizar o pagamento via Pix.

Assim que o pagamento for aprovado, seu bilhete aparece automaticamente em "Meus Bilhetes".

Quer que eu te mostre onde visualizar seus bilhetes?`;
    }

    if (domain === "bilhete") {
      return `Na página "Meus Bilhetes" você acompanha todos os seus bilhetes.

Lá você pode ver:
• Dezenas escolhidas  
• Status (ativo ou finalizado)  
• Data do sorteio  

Também é possível baixar o histórico.

Quer ajuda com alguma dessas opções?`;
    }

    if (domain === "resultado") {
      return `Os resultados são baseados na Loteria Federal.

O sistema utiliza as milhares dos 5 primeiros prêmios para validação.

Você pode acompanhar tudo na página "Resultados".

Quer ajuda para entender como conferir seu bilhete?`;
    }

    if (domain === "carteira") {
      return `A carteira reúne todo seu saldo e movimentações.

Você pode:
• Depositar via Pix  
• Solicitar saque  
• Consultar extrato  

Quer ajuda com alguma dessas operações?`;
    }

    if (domain === "pix") {
      return `O pagamento é feito via Pix.

Assim que o pagamento é aprovado, o sistema libera automaticamente o bilhete ou crédito na carteira.

Se demorar um pouco, aguarde alguns segundos e atualize a página.

Quer ajuda para gerar um pagamento agora?`;
    }

    if (domain === "notificacao") {
      return `Ativar notificações é importante para receber avisos de sorteio e atualizações.

Se estiver desativado, você pode perder informações importantes.

Quer que eu te ajude a ativar?`;
    }

    if (domain === "privacidade") {
      return `Para contato ou política de privacidade, acesse o topo da página inicial.

Suporte: ${SUPPORT_EMAIL}.

Se quiser, posso te explicar como seus dados são utilizados.`;
    }

    return OUT_OF_SCOPE_RESPONSE;
  }
}