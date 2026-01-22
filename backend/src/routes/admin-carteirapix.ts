import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * =========================================
 * 🔐 DEPÓSITO PIX — CARTEIRA (ISOLADO)
 * =========================================
 * POST /admin/carteira/pix
 */
router.post("/pix", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const uid = Number(userId);
    const valor = Number(amount);

    if (!uid || !valor || valor <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    // 1️⃣ cria transação PENDENTE (DEPÓSITO EXCLUSIVO DA CARTEIRA)
    const tx = await prisma.transacao_carteira.create({
      data: {
        userId: uid,
        valor,
        tipo: "DEPOSITO",
        status: "pending",
        metadata: {
          origem: "wallet", // 🔒 BLINDAGEM DEFINITIVA
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    const mpBase =
      process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      return res.status(500).json({ error: "Token Mercado Pago ausente" });
    }

    const body = {
      transaction_amount: valor,
      description: "Depósito na Carteira ZLPix",
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name || "Cliente",
      },
    };

    const resp = await fetchFn(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      return res.status(502).json(mpJson);
    }

    // 2️⃣ atualiza transação com retorno do MP (mantendo blindagem)
    await prisma.transacao_carteira.update({
      where: { id: tx.id },
      data: {
        metadata: {
          origem: "wallet", // 🔒 BLINDAGEM MANTIDA
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      payment_id: mpJson.id,
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("❌ Erro PIX carteira:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;