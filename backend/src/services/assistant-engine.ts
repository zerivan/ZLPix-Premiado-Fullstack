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
    preco: ["preço", "valor", "quanto custa", "custa quanto"]
  };

  private static sensitiveKeywords = [
    "não caiu", "nao caiu",
    "não recebi", "nao recebi",
    "não foi creditado", "nao foi creditado",
    "erro", "falha", "bug"
  ];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

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

    if (domain === "preco" || intent === "price") {
      return `O bilhete custa R$ ${TICKET_PRICE.toFixed(2)}, podendo ser ajustado diretamente pelo administrador conforme as configurações atuais da plataforma.

Deseja saber como realizar uma aposta agora?`;
    }

    if (domain === "aposta") {
      if (intent === "how") {
        return `Para apostar, acesse a página "Apostar".

Você pode selecionar até três dezenas manualmente ou utilizar o botão "Gerar" para escolha automática.  
Depois confirme sua aposta e finalize o pagamento.

Após o pagamento aprovado, o bilhete ficará disponível em "Meus Bilhetes".

Quer que eu explique como funciona a validação do sorteio?`;
      }

      return `Na página de apostas você escolhe até três dezenas ou usa o botão "Gerar" para seleção automática. Após o pagamento confirmado, seu bilhete é criado automaticamente.

Precisa de ajuda para encontrar seus bilhetes depois da compra?`;
    }

    if (domain === "bilhete") {

      if (intent === "purpose") {
        return `O botão de download na página "Meus Bilhetes" permite baixar seu histórico completo em formato CSV.

Esse arquivo contém número do bilhete, data do sorteio, valor e status.

Deseja entender quanto tempo os bilhetes permanecem disponíveis?`;
      }

      if (intent === "duration") {
        return `Os bilhetes permanecem visíveis por até 7 dias após a data do sorteio.

Depois deixam de aparecer na lista principal, mas continuam registrados internamente.

Quer saber como funciona a conferência do resultado?`;
      }

      return `A página "Meus Bilhetes" mostra seus bilhetes ativos e vencidos recentes, permitindo acompanhar status e dezenas escolhidas.

Deseja saber como funciona o botão de download?`;
    }

    if (domain === "resultado") {

      if (intent === "how") {
        return `Os resultados são baseados na Loteria Federal.

O sistema utiliza apenas a milhar do 1º ao 5º prêmio para validação interna.

Quer entender como a validação das milhares funciona?`;
      }

      if (intent === "security") {
        return `Sim. O resultado exibido é baseado na Loteria Federal, fonte pública e oficial.

Deseja saber onde conferir o resultado oficial externamente?`;
      }

      return `A página "Resultados" exibe o número oficial da Loteria Federal e informa o próximo sorteio.

Precisa de ajuda para interpretar o resultado?`;
    }

    if (domain === "carteira") {

      if (intent === "how") {
        return `A carteira armazena seus créditos.

Você pode depositar via Pix, solicitar saque e baixar o extrato completo.

Quer que eu explique como funciona o saque?`;
      }

      if (intent === "purpose") {
        return `A carteira serve para gerenciar saldo, depósitos, saques e histórico financeiro.

Deseja saber como funciona o depósito via Pix?`;
      }

      return `A carteira centraliza saldo e movimentações financeiras do usuário.

Quer entender como baixar o extrato?`;
    }

    if (domain === "pix") {

      if (intent === "security") {
        return `Sim. O pagamento via Pix é seguro e processado dentro dos padrões bancários.

Deseja saber como funciona a confirmação automática?`;
      }

      return `O pagamento é realizado via Pix. Após confirmação, o bilhete é liberado automaticamente.

Precisa de ajuda para gerar um Pix agora?`;
    }

    if (domain === "notificacao") {
      return `É importante permitir notificações para receber avisos de sorteio, atualizações e informações importantes.

Quer saber como ativar as notificações no seu dispositivo?`;
    }

    if (domain === "privacidade") {
      return `Para contato ou política de privacidade, acesse o topo da página inicial.

Suporte direto: ${SUPPORT_EMAIL}.

Deseja que eu explique quais dados são armazenados pelo sistema?`;
    }

    return OUT_OF_SCOPE_RESPONSE;
  }
}