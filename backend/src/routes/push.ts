// src/routes/push.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ============================
 * PUSH — SALVAR TOKEN DO USUÁRIO
 * ============================
 * Chamado pelo FRONT-END
 * POST /push/token
 */
router.post("/push/token", async (req, res) => {
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

export default router;