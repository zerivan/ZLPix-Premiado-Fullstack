import { Router } from "express";
import { prisma } from "../lib/prisma";
import * as admin from "firebase-admin";

const router = Router();

/**
 * ============================
 * FIREBASE ADMIN — INIT
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
 * PUSH — SALVAR TOKEN DO USUÁRIO
 * ============================
 * FRONT chama: POST /push/token
 */
router.post("/token", async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({
        error: "Token ou userId ausente.",
      });
    }

    // Log entrada com sample do token
    const tokenSample = token.substring(0, 20) + "...";
    console.log("📝 POST /push/token - userId:", userId, "token sample:", tokenSample);

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: {
        token,
        userId,
      },
    });

    // Log confirmação após upsert
    console.log("✅ Push token salvo/upsert - userId:", userId, "token sample:", tokenSample);

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao salvar push token:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
});

/**
 * ============================
 * PUSH — ENVIAR NOTIFICAÇÃO
 * ============================
 */
router.post("/send", async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    // Log chamada no início
    console.log("📨 POST /push/send - userId:", userId, "title:", title, "body:", body, "url:", url || "/");

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: "userId, title e body são obrigatórios.",
      });
    }

    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    // Log contagem de tokens encontrados
    console.log("🔑 Tokens encontrados para userId", userId, ":", tokens.length);

    if (!tokens.length) {
      return res.json({
        ok: false,
        message: "Usuário não possui tokens registrados.",
      });
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        url: url || "/",
      },
      tokens: tokens.map((t) => t.token),
    };

    // Log antes de enviar
    console.log("📤 Enviando push - tokenCount:", tokens.length);

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

    // Log após envio com detalhes
    console.log("📥 Resultado - successCount:", response.successCount, "failureCount:", response.failureCount);

    // Log detalhadamente as falhas por token
    response.responses.forEach((r, idx) => {
      if (!r.success) {
        const tokenSample = tokens[idx].token.substring(0, 20) + "...";
        const errorMsg = r.error?.message || "erro desconhecido";
        console.log("❌ Falha no envio - token:", tokenSample, "erro:", errorMsg);
      }
    });

    return res.json({
      ok: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return res.status(500).json({ error: "Erro ao enviar push." });
  }
});

export default router;