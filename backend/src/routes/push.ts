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
    
    console.log("📥 POST /push/token - body:", { 
      userId, 
      tokenSample: token ? token.substring(0, 20) + "..." : "(vazio)" 
    });

    if (!token || !userId) {
      console.log("⚠️ Token ou userId ausente");
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

    console.log(`✅ Token salvo para userId=${userId}, token=${token.substring(0, 20)}...`);

    return res.json({ ok: true });
  } catch (error) {
    console.error("❌ Erro ao salvar push token:", error);
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
    
    console.log("📥 POST /push/send - body:", { userId, title, body, url });

    if (!userId || !title || !body) {
      console.log("⚠️ userId, title ou body ausente");
      return res.status(400).json({
        error: "userId, title e body são obrigatórios.",
      });
    }

    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    console.log(`🔍 Tokens encontrados: ${tokens.length} para userId=${userId}`);

    if (!tokens.length) {
      console.log("🔕 Usuário sem tokens registrados");
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

    console.log(`📤 Enviando multicast para ${tokens.length} tokens...`);
    const response = await admin
      .messaging()
      .sendEachForMulticast(message);
    
    console.log(`📊 Resultado Firebase: successCount=${response.successCount}, failureCount=${response.failureCount}`);

    // Log detalhado de erros por token
    if (response.failureCount > 0) {
      response.responses.forEach((r, idx) => {
        if (!r.success) {
          const tokenSample = tokens[idx].token.substring(0, 20) + "...";
          console.error(`❌ Falha no token [${idx}] (${tokenSample}):`, r.error?.code, r.error?.message);
        }
      });
    }

    return res.json({
      ok: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ Erro ao enviar push:", error);
    return res.status(500).json({ error: "Erro ao enviar push." });
  }
});

export default router;