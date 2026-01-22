import { prisma } from "../lib/prisma";
import * as admin from "firebase-admin";

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
  | { type: "SORTEIO_REALIZADO"; userId: string; ganhou: boolean; valor?: number }
  | { type: "AVISO_SISTEMA"; userId: string; mensagem: string; url?: string };

/**
 * ============================
 * DISPARADOR CENTRAL
 * ============================
 */
export async function notify(event: NotifyEvent) {
  try {
    console.log("🔔 notify() chamado:", event.type, { userId: event.userId });
    
    const payload = montarMensagem(event);
    if (!payload) {
      console.log("🔕 montarMensagem retornou vazio para evento:", event.type);
      return;
    }

    const tokens = await prisma.pushToken.findMany({
      where: { userId: Number(payload.userId) },
      select: { token: true },
    });

    console.log("📲 Tokens encontrados para user", payload.userId, ":", tokens.length);

    if (!tokens.length) {
      console.log("🔕 Usuário sem push token:", payload.userId);
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        url: String(payload.url || "/"),
      },
      tokens: tokens.map((t) => t.token),
    };

    const res = await admin.messaging().sendEachForMulticast(message);

    console.log(
      "📲 PUSH enviado:",
      event.type,
      "✔ Sucesso:",
      res.successCount,
      "✖ Falha:",
      res.failureCount
    );

    // 🔥 REMOVE TOKENS INVÁLIDOS
    const invalidTokens: string[] = [];
    res.responses.forEach((r, idx) => {
      if (!r.success) {
        invalidTokens.push(tokens[idx].token);
        console.log("❌ Token inválido detectado:", tokens[idx].token.substring(0, 20) + "...", "Erro:", r.error?.message || "desconhecido");
      }
    });

    if (invalidTokens.length) {
      await prisma.pushToken.deleteMany({
        where: { token: { in: invalidTokens } },
      });
      console.log("🧹 Tokens inválidos removidos da base:", invalidTokens.length);
    }
  } catch (err) {
    console.error("❌ Erro PUSH:", event.type, err);
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