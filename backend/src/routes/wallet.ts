// backend/src/routes/wallet.ts
import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * 🔐 Identifica usuário (USER_ID)
 */
function getUserId(req: any): number | null {
  const userId =
    req.headers["x-user-id"] ||
    req.query.userId ||
    req.body?.userId;

  if (!userId) return null;
  const n = Number(userId);
  return Number.isNaN(n) ? null : n;
}

/**
 * =========================
 * POST /wallet/ensure
 * =========================
 * Garante que a wallet exista
 */
router.post("/ensure", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      await prisma.wallet.create({
        data: {
          userId,
          saldo: 0,
          createdAt: new Date(),
        },
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro wallet/ensure:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * GET /wallet/saldo
 * =========================
 */
router.get("/saldo", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    return res.json({
      saldo: wallet ? Number(wallet.saldo) : 0,
    });
  } catch (err) {
    console.error("Erro wallet/saldo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * POST /wallet/depositar
 * =========================
 * Cria transação de DEPÓSITO
 * Crédito entra só no webhook
 */
router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // garante wallet
    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      await prisma.wallet.create({
        data: {
          userId,
          saldo: 0,
          createdAt: new Date(),
        },
      });
    }

    // cria transação PIX (depósito)
    const transacao = await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "deposito",
        },
      },
    });

    return res.json({
      redirectUrl: `/pix?transacaoId=${transacao.id}`,
    });
  } catch (err) {
    console.error("Erro wallet/depositar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;