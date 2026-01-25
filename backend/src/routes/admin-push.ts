import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

/**
 * =========================================
 * ADMIN PUSH MANUAL
 * POST /api/admin/push/send
 * =========================================
 */
router.post("/send", async (req, res) => {
  try {
    const { title, body, url, userId, broadcast } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "title e body são obrigatórios",
      });
    }

    let tokens: { token: string }[] = [];

    // 🔹 ENVIO PARA UM USUÁRIO ESPECÍFICO
    if (userId) {
      tokens = await prisma.pushToken.findMany({
        where: { userId: Number(userId) },
        select: { token: true },
      });
    }

    // 🔹 ENVIO PARA TODOS
    if (broadcast) {
      tokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    }

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

    return res.json({
      ok: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("Erro admin push:", error);
    return res.status(500).json({
      error: "Erro ao enviar push",
    });
  }
});

export default router;
