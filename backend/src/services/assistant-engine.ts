type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";

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

Se puder reformular sua pergunta dentro do contexto do aplicativo, terei prazer em ajudar.`;

export class AssistantEngine {

  // =============================
  // KEYWORDS POR DOMÍNIO
  // =============================

  private static domains = {
    aposta: ["apostar", "aposta", "gerar", "dezenas"],
    bilhete: ["bilhete", "meus bilhetes", "download", "historico", "histórico"],
    resultado: ["resultado", "sorteio", "numero sorteado", "número sorteado"],
    carteira: ["carteira", "saldo", "sacar", "depositar", "extrato"],
    pix: ["pix", "pagamento"],
    notificacao: ["notificação", "notificacao", "avisos"],
    privacidade: ["privacidade", "contato", "suporte"]
  };

  private static sensitiveKeywords = [
    "não caiu", "nao caiu",
    "não recebi", "nao recebi",
    "não foi creditado", "nao foi creditado",
    "erro", "falha", "bug"
  ];

  // =============================
  // PROCESSAMENTO PRINCIPAL
  // =============================

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();

    // 🔒 Financeiro prioritário
    if (this.containsKeyword(normalized, this.sensitiveKeywords)) {
      return { reply: FINANCIAL_RESPONSE };
    }

    const intent = this.detectIntent(normalized);
    const domain = this.detectDomain(normalized);

    if (!domain) {
      return { reply: OUT_OF_SCOPE_RESPONSE };
    }

    const reply = this.buildResponse(intent, domain);
    return { reply };
  }

  // =============================
  // INTENT DETECTION
  // =============================

  private static detectIntent(text: string): string {
    if (text.startsWith("como")) return "how";
    if (text.includes("para que serve")) return "purpose";
    if (text.includes("o que acontece")) return "what_happens";
    if (text.includes("é seguro") || text.includes("seguro")) return "security";
    if (text.includes("quanto tempo")) return "duration";
    if (text.includes("onde")) return "location";
    return "info";
  }

  // =============================
  // DOMAIN DETECTION
  // =============================

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

  // =============================
  // RESPOSTAS DINÂMICAS
  // =============================

  private static buildResponse(intent: string, domain: string): string {

    // ================= APOSTA =================
    if (domain === "aposta") {
      if (intent === "how") {
        return `Para apostar, acesse a página "Apostar".

Você pode selecionar até três dezenas manualmente ou utilizar o botão "Gerar" para escolha automática.  
Depois confirme sua aposta e finalize o pagamento.

Após o pagamento aprovado, o bilhete ficará disponível em "Meus Bilhetes".`;
      }

      return `Na página de apostas você escolhe até três dezenas ou usa o botão "Gerar" para seleção automática. Após o pagamento confirmado, seu bilhete é criado automaticamente.`;
    }

    // ================= BILHETE =================
    if (domain === "bilhete") {

      if (intent === "purpose") {
        return `O botão de download na página "Meus Bilhetes" permite baixar seu histórico completo em formato CSV.

Esse arquivo contém dados como número do bilhete, data do sorteio, valor e status.  
Ele pode ser usado para controle pessoal ou conferência.`;
      }

      if (intent === "duration") {
        return `Os bilhetes permanecem visíveis na área "Meus Bilhetes" até 7 dias após a data do sorteio.

Após esse período, eles deixam de aparecer na lista principal, mas continuam registrados no sistema.`;
      }

      return `A página "Meus Bilhetes" mostra todos os seus bilhetes ativos e os vencidos recentes.

Ali você pode acompanhar status, conferir dezenas e baixar o histórico.`;
    }

    // ================= RESULTADO =================
    if (domain === "resultado") {

      if (intent === "how") {
        return `Os resultados são baseados na Loteria Federal.

O sistema utiliza os números oficiais divulgados e considera apenas a milhar do 1º ao 5º prêmio para validação interna.

Você pode conferir os números na página "Resultados".`;
      }

      if (intent === "security") {
        return `Sim. O resultado exibido é baseado na Loteria Federal, uma fonte pública e oficial.

O sistema apenas consulta o número divulgado, sem qualquer manipulação interna.`;
      }

      return `A página "Resultados" exibe o número oficial da Loteria Federal e informa o próximo sorteio.`;
    }

    // ================= CARTEIRA =================
    if (domain === "carteira") {

      if (intent === "how") {
        return `A carteira é onde ficam seus créditos dentro do sistema.

Você pode:
• Depositar via Pix  
• Solicitar saque  
• Baixar o extrato completo  

Todos os movimentos ficam registrados para controle.`;
      }

      if (intent === "purpose") {
        return `A carteira serve para gerenciar seus créditos dentro da plataforma.

O botão "Depositar" gera um Pix.  
O botão "Sacar" permite solicitar retirada.  
O botão de download baixa seu histórico financeiro.`;
      }

      return `A carteira centraliza saldo, depósitos, saques e histórico financeiro.`;
    }

    // ================= PIX =================
    if (domain === "pix") {

      if (intent === "security") {
        return `Sim. O pagamento via Pix é seguro e processado dentro dos padrões bancários.

Após confirmação automática, seu bilhete é gerado imediatamente.`;
      }

      return `O pagamento é feito via Pix. Após confirmação, o sistema libera automaticamente seu bilhete.`;
    }

    // ================= NOTIFICAÇÃO =================
    if (domain === "notificacao") {
      return `É importante permitir notificações do aplicativo.

Assim você recebe:
• Avisos de sorteio  
• Atualizações  
• Informações importantes  

Você pode ativar isso nas configurações do seu navegador ou dispositivo.`;
    }

    // ================= PRIVACIDADE =================
    if (domain === "privacidade") {
      return `Para entrar em contato ou consultar a política de privacidade, acesse a área correspondente no topo da página inicial.

Para suporte direto, envie e-mail para ${SUPPORT_EMAIL}.`;
    }

    return OUT_OF_SCOPE_RESPONSE;
  }
}