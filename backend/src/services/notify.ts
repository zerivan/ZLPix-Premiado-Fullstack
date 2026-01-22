import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

/**
 * ============================
 * TIPOS DE EVENTO
 * ============================
 */
export type NotifyEvent =
  | { type: "BILHETE_CRIADO"; userId: string; codigo: string }
  | { type: "PIX_PAGO"; userId: string; valor: number }
  | { type: "PIX_PENDENTE"; userId: string; valor: number }
  | { type: "CARTEIRA_CREDITO"; userId: string; valor: number }
  | { type: "CARTEIRA_DEBITO"; userId: string; valor: number }
  | { type: "SAQUE_SOLICITADO"; userId: string; valor: number }
  | { type: "SAQUE_PAGO"; userId: string; valor: number }
  | { type: "SORTEIO_REALIZADO"; userId: string; ganhou: boolean; valor?: number }
  | { type: "AVISO_SISTEMA"; userId: string; mensagem: string; url?: string };

/**
 * ============================
 * DISPARADOR CENTRAL
 * ============================
 */
export async function notify(event: NotifyEvent) {
  try {
    console.log(`📢 Iniciando envio de notificação: ${event.type} para userId: ${event.userId}`);
    
    const payload = montarMensagem(event);
    if (!payload) {
      console.warn(`⚠️ Tipo de evento não reconhecido: ${event.type}`);
      return;
    }

    const tokens = await prisma.pushToken.findMany({
      where: { userId: Number(payload.userId) },
      select: { token: true },
    });

    if (!tokens.length) {
      console.log(`🔕 Usuário ${payload.userId} não possui tokens push registrados`);
      return;
    }

    console.log(`📱 Enviando push para ${tokens.length} token(s) do usuário ${payload.userId}`);

    const messaging = getMessaging();
    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: String(payload.url || "/"),
      },
      tokens: tokens.map((t) => t.token),
    };

    const res = await messaging.sendEachForMulticast(message);

    // 🔥 REMOVE TOKENS INVÁLIDOS
    const invalidTokens: string[] = [];
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        invalidTokens.push(tokens[idx].token);
        console.warn(`⚠️ Token inválido/erro: ${tokens[idx].token.substring(0, 20)}... - ${r.error?.message}`);
      }
    });

    if (invalidTokens.length) {
      await prisma.pushToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });
      console.log(`🧹 ${invalidTokens.length} token(s) inválido(s) removido(s)`);
    }

    console.log(
      `✅ PUSH enviado: ${event.type} | ✔ ${res.successCount} sucesso | ✖ ${res.failureCount} falha`
    );
  } catch (err) {
    console.error(`❌ Erro ao enviar PUSH [${event.type}]:`, err);
    // Log additional details if available
    if (err instanceof Error) {
      console.error(`   Mensagem: ${err.message}`);
      console.error(`   Stack: ${err.stack?.substring(0, 200)}`);
    }
  }
}

/**
 * ============================
 * MONTADOR DE MENSAGEM
 * ============================
 */
function montarMensagem(event: NotifyEvent) {
  switch (event.type) {
    case "BILHETE_CRIADO":
      return {
        userId: event.userId,
        title: "🎟️ Bilhete criado",
        body: `Seu bilhete ${event.codigo} foi gerado com sucesso`,
        url: "/meus-bilhetes",
      };

    case "PIX_PAGO":
      return {
        userId: event.userId,
        title: "💰 PIX confirmado",
        body: `Pagamento de R$ ${event.valor.toFixed(2)} aprovado`,
        url: "/carteira",
      };

    case "PIX_PENDENTE":
      return {
        userId: event.userId,
        title: "⏳ PIX pendente",
        body: `Aguardando PIX de R$ ${event.valor.toFixed(2)}`,
        url: "/carteira",
      };

    case "CARTEIRA_CREDITO":
      return {
        userId: event.userId,
        title: "💳 Carteira creditada",
        body: `Entrou R$ ${event.valor.toFixed(2)} na sua carteira`,
        url: "/carteira",
      };

    case "CARTEIRA_DEBITO":
      return {
        userId: event.userId,
        title: "💳 Carteira debitada",
        body: `Saiu R$ ${event.valor.toFixed(2)} da sua carteira`,
        url: "/carteira",
      };

    case "SAQUE_SOLICITADO":
      return {
        userId: event.userId,
        title: "🏦 Saque solicitado",
        body: `Saque de R$ ${event.valor.toFixed(2)} em análise`,
        url: "/carteira",
      };

    case "SAQUE_PAGO":
      return {
        userId: event.userId,
        title: "✅ Saque pago",
        body: `Seu saque de R$ ${event.valor.toFixed(2)} foi realizado`,
        url: "/carteira",
      };

    case "SORTEIO_REALIZADO":
      return {
        userId: event.userId,
        title: "🏆 Sorteio realizado",
        body: event.ganhou
          ? `Parabéns! Você ganhou R$ ${event.valor?.toFixed(2)}`
          : "O sorteio foi realizado. Confira o resultado!",
        url: "/resultado",
      };

    case "AVISO_SISTEMA":
      return {
        userId: event.userId,
        title: "📢 Aviso do sistema",
        body: event.mensagem,
        url: event.url || "/",
      };

    default:
      return null;
  }
}