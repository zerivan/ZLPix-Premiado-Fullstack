import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = express.Router();

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

router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    const tx = await prisma.transacao_carteira.create({
      data: {
        userId,
        valor: Number(valor),
        tipo: "DEPOSITO",
        status: "pending",
        metadata: {
          origem: "wallet"
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    if (!mpToken) {
      return res.status(500).json({ error: "Token Mercado Pago ausente" });
    }

    const body = {
      transaction_amount: Number(valor),
      description: "Depósito na Carteira ZLPix",
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name || "Cliente",
      },
    };

    const resp = await fetchFn(
      "https://api.mercadopago.com/v1/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mpToken}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(body),
      }
    );

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      return res.status(502).json({ error: "Erro ao gerar PIX" });
    }

    await prisma.transacao_carteira.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          origem: "wallet",
          mpResponse: mpJson
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

    const saquePendente = await prisma.transacao_carteira.findFirst({
      where: {
        userId,
        status: "pending",
        tipo: "SAQUE",
      },
    });

    if (saquePendente) {
      return res.status(400).json({
        error: "Você já possui um saque em análise",
      });
    }

    await prisma.transacao_carteira.create({
      data: {
        userId,
        valor: Number(valor),
        tipo: "SAQUE",
        status: "pending",
        metadata: {
          origem: "wallet",
          pixKey: pixKey || null,
        },
      },
    });

    await notify({
      type: "SAQUE_SOLICITADO",
      userId: String(userId),
      valor: Number(valor),
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro wallet/saque:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/saldo", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "Usuário não identificado" });
    }

    let wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          saldo: 0,
        },
      });
    }

    return res.json({ saldo: Number(wallet.saldo) });
  } catch (err) {
    console.error("Erro wallet/saldo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.get("/historico", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "Usuário não identificado" });
    }

    const transacoes = await prisma.transacao_carteira.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(transacoes);
  } catch (err) {
    console.error("Erro wallet/historico:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * GET /wallet/payment-status/:paymentId
 * Verificação de status de pagamento de depósito em carteira
 * =========================
 */
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ error: "paymentId ausente" });
    }

    const transacao = await prisma.transacao_carteira.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
      select: {
        status: true,
        tipo: true,
      },
    });

    if (!transacao) {
      return res.json({ status: "pending" });
    }

    if (transacao.tipo !== "DEPOSITO") {
      return res.status(404).json({
        error: "Pagamento encontrado, mas não é um depósito. Use o endpoint apropriado.",
      });
    }

    return res.json({
      status: transacao.status,
    });
  } catch (err) {
    console.error("Erro wallet/payment-status:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;