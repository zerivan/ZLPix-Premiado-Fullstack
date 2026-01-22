import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

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
      console.warn("⚠️ Push token registro falhou: token ou userId ausente");
      return res.status(400).json({
        error: "Token ou userId ausente.",
      });
    }

    console.log(`📲 Registrando push token para userId: ${userId}`);

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: {
        token,
        userId,
      },
    });

    console.log(`✅ Push token registrado com sucesso para userId: ${userId}`);

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

    if (!userId || !title || !body) {
      console.warn("⚠️ Push envio falhou: parâmetros obrigatórios ausentes");
      return res.status(400).json({
        error: "userId, title e body são obrigatórios.",
      });
    }

    console.log(`📤 Solicitação de envio de push: userId: ${userId}, title: "${title}"`);

    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (!tokens.length) {
      console.log(`🔕 Usuário ${userId} não possui tokens registrados`);
      return res.json({
        ok: false,
        message: "Usuário não possui tokens registrados.",
      });
    }

    console.log(`📱 Enviando para ${tokens.length} token(s)`);

    const messaging = getMessaging();
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

    const response = await messaging.sendEachForMulticast(message);

    console.log(`✅ Push enviado: ${response.successCount} sucesso, ${response.failureCount} falha`);

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