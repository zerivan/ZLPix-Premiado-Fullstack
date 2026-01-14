import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

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
 * GET /wallet/historico
 * =========================
 * HISTÓRICO LIMPO DA CARTEIRA
 * (somente depósitos e saques)
 */
router.get("/historico", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const historico = await prisma.transacao.findMany({
      where: {
        userId,
        OR: [
          {
            metadata: {
              path: ["tipo"],
              equals: "deposito",
            },
          },
          {
            metadata: {
              path: ["tipo"],
              equals: "saque",
            },
          },
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
  } catch (err) {
    console.error("Erro wallet/historico:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * POST /wallet/depositar
 * =========================
 */
router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
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

    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    const tx = await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: { tipo: "deposito" },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    if (!mpToken) {
      return res.status(500).json({ error: "MP token ausente" });
    }

    const resp = await fetchFn("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: Number(valor),
        description: "Depósito ZLPix",
        payment_method_id: "pix",
        payer: {
          email: user?.email || "cliente@zlpix.com",
          first_name: user?.name || "Cliente",
        },
      }),
    });

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      console.error("Erro MP depósito:", mpJson);
      return res.status(502).json({ error: "Erro ao gerar PIX" });
    }

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          tipo: "deposito",
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
  } catch (err) {
    console.error("Erro wallet/depositar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * POST /wallet/saque
 * =========================
 */
router.post("/saque", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor, pixKey } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet || Number(wallet.saldo) < Number(valor)) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "saque",
          pixKey: pixKey || null,
        },
      },
    });

    return res.json({
      ok: true,
      message: "Saque solicitado e enviado para análise",
    });
  } catch (err) {
    console.error("Erro wallet/saque:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;