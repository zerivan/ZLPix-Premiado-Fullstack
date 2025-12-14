import axios from "axios";

/**
 * Tipos de mensagens suportadas
 */
type WhatsAppTipo =
  | "BILHETE_GERADO"
  | "BILHETE_PREMIADO";

interface WhatsAppBilheteData {
  telefone: string;        // 5599999999999
  bilheteId: number;
  dezenas: string;
  valor: number;
  sorteioData: Date;
  premio?: number;
}

/**
 * Serviço central de envio de WhatsApp
 * Não cria rota, não cria endpoint público
 */
export async function enviarWhatsApp(
  tipo: WhatsAppTipo,
  dados: WhatsAppBilheteData
) {
  try {
    const {
      telefone,
      bilheteId,
      dezenas,
      valor,
      sorteioData,
      premio,
    } = dados;

    if (!telefone) {
      console.warn("WhatsApp: telefone não informado");
      return;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      console.warn("WhatsApp: variáveis Twilio não configuradas");
      return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Mensagem final (Twilio Sandbox aceita texto livre)
    let mensagem = "";

    if (tipo === "BILHETE_GERADO") {
      mensagem =
        `🎟️ Bilhete gerado com sucesso!\n\n` +
        `Bilhete: ${bilheteId}\n` +
        `Dezenas: ${dezenas}\n` +
        `Sorteio: ${sorteioData.toLocaleDateString("pt-BR")}\n` +
        `Valor: R$ ${valor.toFixed(2)}\n\n` +
        `Boa sorte! 🍀`;
    }

    if (tipo === "BILHETE_PREMIADO") {
      mensagem =
        `🎉 PARABÉNS! SEU BILHETE FOI PREMIADO!\n\n` +
        `Bilhete: ${bilheteId}\n` +
        `Dezenas: ${dezenas}\n` +
        `Sorteio: ${sorteioData.toLocaleDateString("pt-BR")}\n` +
        `Prêmio: R$ ${premio?.toFixed(2)}\n\n` +
        `Obrigado por participar! 🏆`;
    }

    await axios.post(
      url,
      new URLSearchParams({
        From: from,
        To: `whatsapp:${telefone}`,
        Body: mensagem,
      }),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(`WhatsApp enviado (${tipo}) para ${telefone}`);
  } catch (error: any) {
    console.error(
      "Erro ao enviar WhatsApp:",
      error?.response?.data || error.message
    );
  }
}