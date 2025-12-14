import axios from "axios";

/**
 * Tipos de mensagens suportados
 */
type WhatsAppTipo =
  | "BILHETE_GERADO"
  | "BILHETE_PREMIADO";

interface WhatsAppBilheteData {
  telefone: string; // ex: 5599999999999
  bilheteId: number;
  dezenas: string;
  valor: number;
  sorteioData: Date | string;
  premio?: number;
}

/**
 * Serviço central de envio de WhatsApp
 * NÃO cria rota
 * NÃO cria endpoint público
 */
export async function enviarWhatsApp(
  tipo: WhatsAppTipo,
  dados: WhatsAppBilheteData
) {
  try {
    let {
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

    // 🔒 Normaliza telefone (remove tudo que não for número)
    telefone = telefone.replace(/\D/g, "");

    // 🔒 Garante DDI Brasil
    if (!telefone.startsWith("55")) {
      telefone = "55" + telefone;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    // ⚠️ Sandbox FIXO
    const from = "whatsapp:+14155238886";

    if (!accountSid || !authToken) {
      console.warn("WhatsApp: credenciais Twilio não configuradas");
      return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const dataSorteio = new Date(sorteioData).toLocaleDateString("pt-BR");

    let mensagem = "";

    if (tipo === "BILHETE_GERADO") {
      mensagem =
        `🎟️ Bilhete gerado com sucesso!\n\n` +
        `Bilhete: ${bilheteId}\n` +
        `Dezenas: ${dezenas}\n` +
        `Sorteio: ${dataSorteio}\n` +
        `Valor: R$ ${valor.toFixed(2)}\n\n` +
        `Boa sorte! 🍀`;
    }

    if (tipo === "BILHETE_PREMIADO") {
      mensagem =
        `🎉 PARABÉNS! SEU BILHETE FOI PREMIADO!\n\n` +
        `Bilhete: ${bilheteId}\n` +
        `Dezenas: ${dezenas}\n` +
        `Sorteio: ${dataSorteio}\n` +
        `Prêmio: R$ ${premio?.toFixed(2)}\n\n` +
        `Obrigado por participar! 🏆`;
    }

    await axios.post(
      url,
      new URLSearchParams({
        From: from,
        To: `whatsapp:+${telefone}`,
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

    console.log(`WhatsApp enviado (${tipo}) para +${telefone}`);
  } catch (error: any) {
    console.error(
      "Erro ao enviar WhatsApp:",
      error?.response?.data || error.message
    );
  }
}