import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

// =====================================================
// 🧾 PIX — PAGAMENTO DE BILHETES (PURO, SEM CARTEIRA)
// =====================================================
router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (
      !userId ||
      !amount ||
      !Array.isArray(bilhetes) ||
      bilhetes.length === 0
    ) {
      return res.status(400).json({ error: "Payload inválido." });
    }

    const uid = Number(userId);
    const total = Number(amount);

    if (!uid || Number.isNaN(uid)) {
      return res.status(400).json({ error: "userId inválido." });
    }

    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido." });
    }

    // cria transação PENDENTE (bilhete)
    const tx = await prisma.transacao.create({
      data: {
        userId: uid,
        valor: total,
        status: "pending",
        metadata: {
          tipo: "bilhete",
          bilhetes,
        },
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
        transaction_amount: total,
        description: description || "Bilhetes ZLPix",
        payment_method_id: "pix",
        payer: {
          email: user.email,
          first_name: user.name || "Cliente",
        },
      }),
    });

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      console.error("Erro Mercado Pago:", mpJson);
      return res.status(502).json(mpJson);
    }

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          tipo: "bilhete",
          bilhetes,
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      payment_id: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("pix/create erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// =====================================================
// 💰 PIX — DEPÓSITO NA CARTEIRA (ISOLADO)
// =====================================================
router.post("/create-deposito", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Payload inválido." });
    }

    const uid = Number(userId);
    const total = Number(amount);

    if (!uid || Number.isNaN(uid)) {
      return res.status(400).json({ error: "userId inválido." });
    }

    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido." });
    }

    const tx = await prisma.transacao.create({
      data: {
        userId: uid,
        valor: total,
        status: "pending",
        metadata: {
          tipo: "deposito",
        },
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
        transaction_amount: total,
        description: "Depósito ZLPix",
        payment_method_id: "pix",
        payer: {
          email: user.email,
          first_name: user.name || "Cliente",
        },
      }),
    });

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      console.error("Erro MP depósito:", mpJson);
      return res.status(502).json(mpJson);
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
      payment_id: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("pix/create-deposito erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;