// src/routes/push.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";

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

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: {
        token,
        userId,
      },
    });

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
 * USO INTERNO / ADMIN / TESTE
 */
router.post("/send", async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: "userId, title e body são obrigatórios.",
      });
    }

    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

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

    const response = await admin
      .messaging()
      .sendEachForMulticast(message);

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