import axios from "axios";

type WhatsAppTipo =
  | "BILHETE_GERADO"
  | "BILHETE_PREMIADO";

interface WhatsAppBilheteData {
  telefone: string;
  bilheteId: number;
  dezenas: string;
  valor: number;
  sorteioData: Date;
  premio?: number;
}

function montarMensagem(
  tipo: WhatsAppTipo,
  dados: WhatsAppBilheteData
) {
  const dataSorteio = new Date(dados.sorteioData).toLocaleDateString("pt-BR");

  if (tipo === "BILHETE_PREMIADO") {
    return (
      `🎉 PARABÉNS! SEU BILHETE FOI PREMIADO!\n\n` +
      `🎟 Bilhete: #${dados.bilheteId}\n` +
      `🔢 Dezenas: ${dados.dezenas}\n` +
      `💰 Prêmio: R$ ${dados.premio?.toFixed(2)}\n` +
      `📅 Sorteio: ${dataSorteio}\n\n` +
      `ZLPix Premiado`
    );
  }

  // BILHETE_GERADO
  return (
    `✅ BILHETE GERADO COM SUCESSO!\n\n` +
    `🎟 Bilhete: #${dados.bilheteId}\n` +
    `🔢 Dezenas: ${dados.dezenas}\n` +
    `💵 Valor: R$ ${dados.valor.toFixed(2)}\n` +
    `📅 Sorteio: ${dataSorteio}\n\n` +
    `Boa sorte 🍀\n` +
    `ZLPix Premiado`
  );
}

export async function enviarWhatsApp(
  tipo: WhatsAppTipo,
  dados: WhatsAppBilheteData
) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn("WhatsApp: credenciais Twilio não configuradas");
      return;
    }

    let telefone = dados.telefone.replace(/\D/g, "");
    if (!telefone.startsWith("55")) telefone = "55" + telefone;

    const mensagem = montarMensagem(tipo, dados);

    console.log("📲 Enviando WhatsApp Sandbox");
    console.log("➡️ Para:", telefone);
    console.log("➡️ Mensagem:", mensagem);

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const response = await axios.post(
      url,
      new URLSearchParams({
        From: "whatsapp:+14155238886", // Sandbox Twilio
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

    console.log("✅ WhatsApp enviado");
    console.log("🆔 SID:", response.data.sid);
    console.log("📦 Status:", response.data.status);
  } catch (err: any) {
    console.error(
      "❌ Erro ao enviar WhatsApp:",
      err?.response?.data || err.message
    );
  }
}