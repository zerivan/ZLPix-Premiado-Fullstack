import * as admin from "firebase-admin";
import { prisma } from "../lib/prisma";

/**
 * =====================================================
 * NOTIFY — SERVIÇO CENTRAL DE NOTIFICAÇÕES (DIRETO)
 * =====================================================
 * ✔ SEM HTTP
 * ✔ SEM axios
 * ✔ SEM BASE_URL
 * ✔ DISPARO DIRETO VIA FIREBASE ADMIN
 */

/**
 * ============================
 * FIREBASE ADMIN INIT (SAFE)
 * ============================
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

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
  | {
      type: "SORTEIO_REALIZADO";
      userId: string;
      ganhou: boolean;
      valor?: number;
    }
  | { type: "AVISO_SISTEMA"; userId: string; mensagem: string; url?: string };

/**
 * ============================
 * FUNÇÃO PRINCIPAL
 * ============================
 */
export async function notify(event: NotifyEvent) {
  try {
    const payload = montarMensagem(event);
    if (!payload) return;

    const tokens = await prisma.pushToken.findMany({
      where: { userId: Number(payload.userId) },
      select: { token: true },
    });

    if (!tokens.length) {
      console.log(
        "🔕 Usuário sem tokens push:",
        payload.userId
      );
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: payload.url || "/",
      },
      tokens: tokens.map((t) => t.token),
    };

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    console.log("📲 PUSH ENVIADO:", {
      type: event.type,
      userId: payload.userId,
      success: response.successCount,
      failure: response.failureCount,
    });
  } catch (error) {
    console.error(
      "❌ ERRO AO DISPARAR PUSH:",
      event,
      error
    );
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
        title: "💰 Pagamento confirmado",
        body: `PIX de R$ ${event.valor.toFixed(2)} aprovado`,
        url: "/carteira",
      };

    case "PIX_PENDENTE":
      return {
        userId: event.userId,
        title: "⏳ PIX pendente",
        body: `Aguardando confirmação do PIX de R$ ${event.valor.toFixed(2)}`,
        url: "/carteira",
      };

    case "CARTEIRA_CREDITO":
      return {
        userId: event.userId,
        title: "💳 Carteira creditada",
        body: `Você recebeu R$ ${event.valor.toFixed(2)} na carteira`,
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
        title: "✅ Saque realizado",
        body: `Seu saque de R$ ${event.valor.toFixed(2)} foi pago`,
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