import { Router } from "express";
import { prisma } from "../lib/prisma";
import { getMessaging } from "../lib/firebase";

const router = Router();

/**
 * ============================
 * ADMIN PUSH MANUAL
 * ============================
 * POST /admin/push
 *
 * Body:
 * {
 *   userId?: number,
 *   title: string,
 *   body: string,
 *   url?: string
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { userId, title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "title e body são obrigatórios",
      });
    }

    let tokens: { token: string }[] = [];

    // 🔹 Envio para usuário específico
    if (userId) {
      tokens = await prisma.pushToken.findMany({
        where: { userId: Number(userId) },
        select: { token: true },
      });
    } else {
      // 🔹 Envio para todos
      tokens = await prisma.pushToken.findMany({
        select: { token: true },
      });
    }

    if (!tokens.length) {
      return res.json({
        ok: false,
        message: "Nenhum token encontrado.",
      });
    }

    const messaging = getMessaging();

    const response = await messaging.sendEachForMulticast({
      notification: {
        title,
        body,
      },
      data: {
        url: String(url || "/"),
      },
      tokens: tokens.map((t) => t.token),
    });

    return res.json({
      ok: true,
      totalTokens: tokens.length,
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