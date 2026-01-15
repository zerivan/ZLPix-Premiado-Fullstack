// backend/src/routes/pix.ts
import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

// =====================================================
// 🧾 PIX — PAGAMENTO DE BILHETES (COM SALDO OU PIX)
// =====================================================
router.post("/create-bilhete", async (req, res) => {
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

    // Usuário
    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { email: true, name: true },
    });
    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido." });
    }

    // Carteira
    const wallet = await prisma.wallet.findFirst({
      where: { userId: uid },
    });

    // ============================
    // 💳 PAGAMENTO COM SALDO
    // ============================
    if (wallet && Number(wallet.saldo) >= total) {
      // debita saldo
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          saldo: {
            decrement: total,
          },
        },
      });

      // cria transação como PAGA
      const tx = await prisma.transacao.create({
        data: {
          userId: uid,
          valor: total,
          status: "paid",
          metadata: {
            type: "BILHETE",
            source: "WALLET",
            bilhetes,
          },
        },
      });

      return res.json({
        paid: true,
        method: "wallet",
        transacaoId: tx.id,
      });
    }

    // ============================
    // 🧾 SEM SALDO → PIX
    // ============================
    const tx = await prisma.transacao.create({
      data: {
        userId: uid,
        valor: total,
        status: "pending",
        metadata: {
          type: "BILHETE",
          source: "PIX",
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
      return res.status(502).json(mpJson);
    }

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          type: "BILHETE",
          source: "PIX",
          bilhetes,
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      paid: false,
      payment_id: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("pix/create-bilhete erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// =====================================================
// 💰 PIX — DEPÓSITO NA CARTEIRA
// =====================================================
router.post("/create-deposito", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Payload inválido." });
    }

    const uid = Number(userId);
    const total = Number(amount);

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
          type: "DEPOSITO",
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

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
    if (!resp.ok) return res.status(502).json(mpJson);

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          type: "DEPOSITO",
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