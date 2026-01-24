import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo (compat)
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * =========================
 * POST /pix/create
 * Criação de PIX para pagamento de BILHETES
 * =========================
 */
router.post("/create", async (req, res) => {
  try {
    const { userId, amount, bilhetes, description } = req.body;

    if (
      !userId ||
      !amount ||
      Number(amount) <= 0 ||
      !Array.isArray(bilhetes) ||
      bilhetes.length === 0
    ) {
      return res.status(400).json({
        error:
          "Dados inválidos. userId, amount e bilhetes são obrigatórios",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    const tx = await prisma.transacao.create({
      data: {
        userId: Number(userId),
        valor: Number(amount),
        tipo: "BILHETE",
        status: "pending",
        metadata: {
          origem: "aposta",
          bilhetes,
          description:
            description || "Pagamento de bilhetes ZLPix",
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    const mpBase =
      process.env.MP_BASE_URL ||
      "https://api.mercadopago.com";

    if (!mpToken) {
      return res.status(500).json({
        error: "Token Mercado Pago ausente",
      });
    }

    const body = {
      transaction_amount: Number(amount),
      description:
        description || "Pagamento de bilhetes ZLPix",
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name || "Cliente",
      },
      external_reference: `bilhete_tx_${tx.id}`,
    };

    const resp = await fetchFn(
      `${mpBase}/v1/payments`,
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

    const mpJson: any = await resp.json().catch(() => null);

    if (!resp.ok || !mpJson) {
      console.error(
        "Erro MercadoPago /payments (pix/create):",
        mpJson || "sem json"
      );
      return res.status(502).json({
        error: "Erro ao gerar PIX",
      });
    }

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          origem: "aposta",
          bilhetes,
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      paymentId: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data
          ?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data
          ?.qr_code ?? null,
    });
  } catch (err) {
    console.error("Erro pix/create:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * GET /pix/payment-status/:paymentId
 * Verificação de status de pagamento de bilhete
 * =========================
 */
router.get(
  "/payment-status/:paymentId",
  async (req, res) => {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return res
          .status(400)
          .json({ error: "paymentId ausente" });
      }

      const transacao =
        await prisma.transacao.findFirst({
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

      if (transacao.tipo !== "BILHETE") {
        return res.status(404).json({
          error:
            "Pagamento encontrado, mas não pertence ao fluxo de bilhete. Use o endpoint de carteira se aplicável.",
        });
      }

      return res.json({
        status: transacao.status,
      });
    } catch (err) {
      console.error(
        "Erro pix/payment-status:",
        err
      );
      return res
        .status(500)
        .json({ error: "Erro interno" });
    }
  }
);

// Healthcheck
router.get("/__ping_pix", (req, res) => {
  res.json({ ping: true, rota: "pix" });
});

export default router;