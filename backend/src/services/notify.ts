import * as admin from "firebase-admin";
import { prisma } from "../lib/prisma";

/**
 * ============================
 * FIREBASE ADMIN INIT
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
  | { type: "CARTEIRA_CREDITO"; userId: string; valor: number }
  | { type: "SAQUE_SOLICITADO"; userId: string; valor: number }
  | { type: "SAQUE_PAGO"; userId: string; valor: number }
  | { type: "SORTEIO_REALIZADO"; userId: string; ganhou: boolean; valor?: number };

/**
 * ============================
 * DISPARO CENTRAL
 * ============================
 */
export async function notify(event: NotifyEvent) {
  const payload = montarMensagem(event);
  if (!payload) return;

  const tokens = await prisma.pushToken.findMany({
    where: { userId: Number(payload.userId) },
    select: { token: true },
  });

  if (!tokens.length) {
    console.log("🔕 Usuário sem tokens:", payload.userId);
    return;
  }

  await admin.messaging().sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: {
      url: payload.url || "/",
    },
  });

  console.log("📲 PUSH:", event.type, payload.userId);
}

/**
 * ============================
 * MENSAGENS
 * ============================
 */
function montarMensagem(event: NotifyEvent) {
  switch (event.type) {
    case "SAQUE_SOLICITADO":
      return {
        userId: event.userId,
        title: "🏦 Saque solicitado",
        body: `Saque de R$ ${event.valor.toFixed(2)} em análise`,
        url: "/carteira",
      };

    case "CARTEIRA_CREDITO":
      return {
        userId: event.userId,
        title: "💰 Carteira creditada",
        body: `Você recebeu R$ ${event.valor.toFixed(2)}`,
        url: "/carteira",
      };

    case "SORTEIO_REALIZADO":
      return {
        userId: event.userId,
        title: "🏆 Sorteio realizado",
        body: event.ganhou
          ? `Parabéns! Você ganhou R$ ${event.valor?.toFixed(2)}`
          : "O sorteio foi realizado. Confira o resultado.",
        url: "/resultado",
      };

    default:
      return null;
  }
}