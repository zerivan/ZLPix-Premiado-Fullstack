type AssistantResponse = {
  reply: string;
};

const SUPPORT_EMAIL = "zlpixpremiado.suporte@gmail.com";

const FINANCIAL_RESPONSE = `Para sua segurança, situações relacionadas a pagamentos, prêmios, saques, créditos na carteira ou possíveis falhas no sistema são tratadas exclusivamente pela administração.

Envie um e-mail para ${SUPPORT_EMAIL} informando seu nome completo e descrevendo detalhadamente o ocorrido para que possamos verificar seu caso com prioridade.`;

const OUT_OF_SCOPE_RESPONSE = `Sou a assistente oficial do ZLpix Premiado.

Posso ajudar com dúvidas sobre:
• Como apostar
• Funcionamento dos sorteios
• Resultado da Loteria Federal
• Meus Bilhetes
• Carteira (saldo, saque e depósito)
• Segurança do Pix
• Notificações e atualizações do aplicativo

Se puder reformular sua pergunta dentro desses temas, ficarei feliz em ajudar.`;

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
    "como jogar", "como apostar", "aposta", "dezenas", "gerar", "bilhete"
  ];

  private static resultadoKeywords = [
    "resultado", "sorteio", "numero sorteado", "número sorteado", "federal"
  ];

  private static carteiraKeywords = [
    "carteira", "saldo", "sacar", "depositar", "histórico"
  ];

  private static bilheteKeywords = [
    "meus bilhetes", "bilhetes", "download", "histórico bilhete"
  ];

  static async process(message: string): Promise<AssistantResponse> {
    const normalized = message.toLowerCase().trim();
    const isLong = normalized.length > 80;

    // 🔒 Financeiro sempre tem prioridade
    if (this.containsKeyword(normalized, this.sensitiveKeywords)) {
      return { reply: FINANCIAL_RESPONSE };
    }

    // 🎯 APOSTAS
    if (this.containsKeyword(normalized, this.apostaKeywords)) {
      return {
        reply: isLong
          ? `Para realizar uma aposta no ZLpix Premiado:

1) Acesse a área de apostas.
2) Escolha até três dezenas manualmente ou utilize o botão "Gerar" para seleção automática.
3) Revise seus números na tela de confirmação.
4) Confirme o pagamento.
5) Após pagamento confirmado, seu bilhete ficará disponível na página "Meus Bilhetes".

Recomendamos ativar as notificações para receber avisos automáticos sobre seus bilhetes e resultados.`
          : `Para apostar, selecione até três dezenas ou use o botão "Gerar", confirme o pagamento e acompanhe seu bilhete em "Meus Bilhetes".`
      };
    }

    // 🎉 RESULTADO
    if (this.containsKeyword(normalized, this.resultadoKeywords)) {
      return {
        reply: isLong
          ? `Os sorteios são baseados oficialmente no resultado da Loteria Federal.

O sistema utiliza as milhares do 1º ao 5º prêmio. A partir dessas milhares são extraídas as dezenas válidas para validação dos bilhetes.

A venda de bilhetes encerra às 17h da quarta-feira. Após esse horário, novas apostas concorrem no próximo sorteio.

Você pode consultar os números na página "Resultado", que utiliza fonte oficial.

Caso não haja ganhador, o prêmio acumula automaticamente para o próximo sorteio.`
          : `O resultado é baseado na Loteria Federal. O sistema valida as milhares do 1º ao 5º prêmio automaticamente.`
      };
    }

    // 💳 CARTEIRA
    if (this.containsKeyword(normalized, this.carteiraKeywords)) {
      return {
        reply: isLong
          ? `A carteira do ZLpix Premiado centraliza seus valores.

• Saldo: mostra créditos disponíveis.
• Depositar: gera pagamento via Pix.
• Sacar: solicita retirada para sua chave cadastrada.
• Histórico: permite download do extrato.

Para segurança, qualquer divergência financeira deve ser tratada pelo e-mail oficial de suporte.`
          : `A carteira mostra seu saldo, permite depositar via Pix e solicitar saque.`
      };
    }

    // 🎟️ MEUS BILHETES
    if (this.containsKeyword(normalized, this.bilheteKeywords)) {
      return {
        reply: isLong
          ? `Na página "Meus Bilhetes" você acompanha:

• Bilhetes ativos até o horário do sorteio.
• Bilhetes vencidos permanecem visíveis por 7 dias após o sorteio.
• Status pode indicar Pago, Premiado ou Não Premiado.
• O botão de download gera um histórico em formato CSV para controle pessoal.

Após o período de permanência, os bilhetes deixam de aparecer na área principal.`
          : `Os bilhetes ficam visíveis até o sorteio e por 7 dias após. O botão de download exporta seu histórico.`
      };
    }

    return { reply: OUT_OF_SCOPE_RESPONSE };
  }

  private static containsKeyword(text: string, keywords: string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  }
}