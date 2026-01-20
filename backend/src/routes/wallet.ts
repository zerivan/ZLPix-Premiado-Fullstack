import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = express.Router();

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
 * ============================
 * GARANTE CARTEIRA
 * ============================
 */
async function garantirCarteira(userId: number) {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!wallet) {
    await prisma.wallet.create({
      data: { userId, saldo: 0, createdAt: new Date() },
    });
  }
}

/**
 * ============================
 * ENSURE
 * ============================
 */
router.post("/ensure", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Usuário não identificado" });
  }

  await garantirCarteira(userId);
  return res.json({ ok: true });
});

/**
 * ============================
 * SALDO
 * ============================
 */
router.get("/saldo", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Usuário não identificado" });
  }

  await garantirCarteira(userId);

  const wallet = await prisma.wallet.findFirst({ where: { userId } });

  return res.json({
    saldo: wallet ? Number(wallet.saldo) : 0,
  });
});

/**
 * ============================
 * HISTÓRICO
 * ============================
 */
router.get("/historico", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Usuário não identificado" });
  }

  const limite = new Date();
  limite.setDate(limite.getDate() - 40);

  const historico = await prisma.transacao.findMany({
    where: {
      userId,
      createdAt: { gte: limite },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json(historico);
});

/**
 * ============================
 * SAQUE
 * ============================
 */
router.post("/saque", async (req, res) => {
  const userId = getUserId(req);
  const { valor, pixKey } = req.body;

  if (!userId || !valor || Number(valor) <= 0) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  await garantirCarteira(userId);

  const wallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!wallet || Number(wallet.saldo) < Number(valor)) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  const saquePendente = await prisma.transacao.findFirst({
    where: {
      userId,
      status: "pending",
      metadata: {
        path: ["tipo"],
        equals: "saque",
      },
    },
  });

  if (saquePendente) {
    return res.status(400).json({
      error: "Você já possui um saque em análise",
    });
  }

  await prisma.transacao.create({
    data: {
      userId,
      valor: Number(valor),
      status: "pending",
      metadata: {
        tipo: "saque",
        origem: "wallet",
        pixKey: pixKey || null,
      },
    },
  });

  // 🔔 NOTIFICAÇÃO
  await notify({
    type: "SAQUE_SOLICITADO",
    userId: String(userId),
    valor: Number(valor),
  });

  return res.json({
    ok: true,
    message: "Saque solicitado e enviado para análise",
  });
});

export default router;