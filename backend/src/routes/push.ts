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
    const normalizedUserId = Number(userId);

    if (!token || !userId || Number.isNaN(normalizedUserId)) {
      console.warn("⚠️ Push token registro falhou: token ou userId ausente");
      return res.status(400).json({
        error: "Token ou userId ausente.",
      });
    }

    console.log(`📲 Registrando push token para userId: ${userId}`);

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId: normalizedUserId },
      create: {
        token,
        userId: normalizedUserId,
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
    const normalizedUserId = Number(userId);

    if (!userId || !title || !body || Number.isNaN(normalizedUserId)) {
      console.warn("⚠️ Push envio falhou: parâmetros obrigatórios ausentes");
      return res.status(400).json({
        error: "userId, title e body são obrigatórios.",
      });
    }

    console.log(`📤 Solicitação de envio de push: userId: ${userId}, title: "${title}"`);

    const tokens = await prisma.pushToken.findMany({
      where: { userId: normalizedUserId },
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

    // 🔥 NOVO: REMOVER TOKENS INVÁLIDOS (CIRÚRGICO)
    if (response.responses && response.responses.length) {
      const tokensToRemove: string[] = [];

      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          const errorCode = resp.error?.code;

          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            tokensToRemove.push(tokens[index].token);
          }
        }
      });

      if (tokensToRemove.length) {
        console.warn(`🧹 Removendo ${tokensToRemove.length} token(s) inválido(s)`);

        await prisma.pushToken.deleteMany({
          where: {
            token: { in: tokensToRemove },
          },
        });
      }
    }

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