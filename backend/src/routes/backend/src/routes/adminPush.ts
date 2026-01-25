import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

/**
 * =====================================
 * POST /admin/push/send
 * Envio manual de notificação
 * =====================================
 */
router.post("/send", async (req, res) => {
  try {
    const { title, body, url, userId } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "title e body são obrigatórios",
      });
    }

    // Se userId for informado → envia só para ele
    // Se não → envia para todos
    const where = userId
      ? { userId: Number(userId) }
      : {};

    const tokens = await prisma.pushToken.findMany({
      where,
      select: { token: true },
    });

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
        url: url || "/home",
      },
      tokens: tokens.map((t) => t.token),
    });

    return res.json({
      ok: true,
      success: response.successCount,
      failure: response.failureCount,
    });
  } catch (error) {
    console.error("Erro admin push:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;