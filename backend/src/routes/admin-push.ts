import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

router.post("/send", async (req, res) => {
  try {
    const { title, body, url, userId, broadcast } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "title e body são obrigatórios",
      });
    }

    const normalizedUserId =
      userId !== undefined && userId !== null && userId !== ""
        ? Number(userId)
        : null;

    const hasValidUserId =
      normalizedUserId !== null &&
      Number.isInteger(normalizedUserId) &&
      normalizedUserId > 0;

    const normalizedBroadcast =
      broadcast === true || broadcast === "true";

    if (normalizedUserId !== null && !hasValidUserId) {
      return res.status(400).json({
        error: "userId inválido",
      });
    }

    if (hasValidUserId && normalizedBroadcast) {
      return res.status(400).json({
        error: "Envio ambíguo",
      });
    }

    let tokens: { token: string }[] = [];

    if (hasValidUserId) {
      tokens = await prisma.pushToken.findMany({
        where: { userId: normalizedUserId },
        select: { token: true },
      });
    } else if (normalizedBroadcast) {
      tokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    } else {
      return res.status(400).json({
        error: "Informe userId ou broadcast",
      });
    }

    console.log(`📱 Tokens encontrados: ${tokens.length}`);

    if (!tokens.length) {
      return res.json({
        ok: false,
        message: "Nenhum token encontrado",
      });
    }

    const messaging = getMessaging();

    const response = await messaging.sendEachForMulticast({
      notification: {
        title,
        body,
      },
      data: {
        url: url || "/",
      },
      tokens: tokens.map((t) => t.token),
    });

    console.log(
      `📊 Firebase response: success=${response.successCount} failure=${response.failureCount}`
    );

    return res.json({
      ok: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ Erro ao enviar push manual:", error);
    return res.status(500).json({
      error: "Erro ao enviar push",
    });
  }
});

export default router;