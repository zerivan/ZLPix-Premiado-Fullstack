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

    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      console.warn("WhatsApp: variáveis de ambiente não configuradas");
      return;
    }

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    // Templates (nomes fictícios – ajustar no Meta)
    let templateName = "";
    let parameters: any[] = [];

    if (tipo === "BILHETE_GERADO") {
      templateName = "bilhete_gerado";

      parameters = [
        { type: "text", text: String(bilheteId) },
        { type: "text", text: dezenas },
        { type: "text", text: sorteioData.toLocaleDateString("pt-BR") },
        { type: "text", text: `R$ ${valor.toFixed(2)}` },
      ];
    }

    if (tipo === "BILHETE_PREMIADO") {
      templateName = "bilhete_premiado";

      parameters = [
        { type: "text", text: String(bilheteId) },
        { type: "text", text: dezenas },
        { type: "text", text: sorteioData.toLocaleDateString("pt-BR") },
        { type: "text", text: `R$ ${premio?.toFixed(2)}` },
      ];
    }

    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: telefone,
        type: "template",
        template: {
          name: templateName,
          language: { code: "pt_BR" },
          components: [
            {
              type: "body",
              parameters,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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