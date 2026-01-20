// backend/src/routes/wallet.ts
import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

function getUserId(req: any): number | null {
  const userId =
    req.headers["x-user-id"] ||
    req.query.userId ||
    req.body?.userId;

  if (!userId) return null;
  const n = Number(userId);
  return Number.isNaN(n) ? null : n;
}

// 🔐 GARANTE CARTEIRA
async function garantirCarteira(userId: number) {
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
}

/**
 * ============================
 * GARANTIR CARTEIRA
 * ============================
 */
router.post("/ensure", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    await garantirCarteira(userId);

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * SALDO
 * ============================
 */
router.get("/saldo", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    await garantirCarteira(userId);

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    return res.json({
      saldo: wallet ? Number(wallet.saldo) : 0,
    });
  } catch {
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * HISTÓRICO
 * ============================
 */
router.get("/historico", async (req, res) => {
  try {
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
        OR: [
          { metadata: { path: ["origem"], equals: "wallet" } },
          { metadata: { path: ["origem"], equals: "sorteio" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        valor: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    });

    return res.json(historico);
  } catch {
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * DEPOSITAR (PIX)
 * ============================
 */
router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    await garantirCarteira(userId);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    const tx = await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "deposito",
          origem: "wallet",
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    const resp = await fetchFn(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          transaction_amount: Number(valor),
          description: "Depósito na Carteira ZLPix",
          payment_method_id: "pix",
          payer: {
            email: user?.email || "cliente@zlpix.com",
            first_name: user?.name || "Cliente",
          },
        }),
      }
    );

    const mpJson: any = await resp.json();

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          tipo: "deposito",
          origem: "wallet",
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      paymentId: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch {
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * SAQUE (DEBITA SALDO)
 * ============================
 */
router.post("/saque", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor, pixKey } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    await garantirCarteira(userId);

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

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

    // 🔥 TRANSAÇÃO ATÔMICA
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: {
          saldo: { decrement: Number(valor) },
        },
      }),

      prisma.transacao.create({
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
      }),
    ]);

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
  } catch (err) {
    console.error("Erro saque:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;