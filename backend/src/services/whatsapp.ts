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

export async function enviarWhatsApp(
  tipo: WhatsAppTipo,
  dados: WhatsAppBilheteData
) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const contentSid = process.env.TWILIO_CONTENT_SID;

    if (!accountSid || !authToken || !contentSid) {
      console.warn("WhatsApp: credenciais ou template não configurados");
      return;
    }

    let telefone = dados.telefone.replace(/\D/g, "");
    if (!telefone.startsWith("55")) telefone = "55" + telefone;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Variáveis do template (ajuste conforme seu template)
    const variables: any = {
      "1": dados.bilheteId,
      "2": dados.dezenas,
      "3": `R$ ${dados.valor.toFixed(2)}`,
      "4": new Date(dados.sorteioData).toLocaleDateString("pt-BR"),
    };

    if (tipo === "BILHETE_PREMIADO" && dados.premio) {
      variables["5"] = `R$ ${dados.premio.toFixed(2)}`;
    }

    await axios.post(
      url,
      new URLSearchParams({
        From: "whatsapp:+14155238886",
        To: `whatsapp:+${telefone}`,
        ContentSid: contentSid,
        ContentVariables: JSON.stringify(variables),
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

    console.log("WhatsApp enviado com template para", telefone);
  } catch (err: any) {
    console.error(
      "Erro ao enviar WhatsApp:",
      err?.response?.data || err.message
    );
  }
}