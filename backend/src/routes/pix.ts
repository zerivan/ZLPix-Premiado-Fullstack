// src/routes/pix.ts
import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!MP_ACCESS_TOKEN) {
  console.error("❌ Nenhum Access Token do Mercado Pago foi encontrado!");
}

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

/* ========================================================
   🔥 ROTA 1 — PIX PARA 1 BILHETE (MODO ANTIGO)
   Continua funcionando para compatibilidade
   ======================================================== */
router.post("/create", async (req, res) => {
  try {
    const { amount, description, bilheteId, userId } = req.body;

    if (!amount || !description || !bilheteId || !userId) {
      return res.status(400).json({
        error: "amount, description, bilheteId e userId são obrigatórios.",
      });
    }

    console.log("📤 Criando PIX (1 bilhete):", { amount, description, bilheteId, userId });

    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",
      payer: { email: "test_user@test.com" },
    };

    const resposta = await axios.post(MP_API_URL, pagamento, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    const data = resposta.data;
    const trx = data?.point_of_interaction?.transaction_data;

    if (!trx) {
      return res.status(500).json({
        error: "Mercado Pago não retornou QR Code.",
        details: data,
      });
    }

    await prisma.transacao.create({
      data: {
        userId: BigInt(userId),
        bilheteId: BigInt(bilheteId),
        valor: Number(amount),
        status: "pending",
        mpPaymentId: String(data.id),
      },
    });

    return res.json({
      status: data.status,
      id: data.id,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO AO CRIAR PIX (1 bilhete):", err.response?.data || err);
    return res.status(500).json({
      error: "Erro ao criar pagamento PIX (single)",
      details: err.response?.data || err.message,
    });
  }
});

/* ========================================================
   🔥 ROTA 2 — PIX EM LOTE (VÁRIOS BILHETES)
   COMPATÍVEL COM A NOVA TELA /pagamento
   ======================================================== */
router.post("/create-lote", async (req, res) => {
  try {
    const { bilhetes, userId, amount, description } = req.body;

    if (!bilhetes || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Lista de bilhetes inválida." });
    }
    if (!userId || !amount || !description) {
      return res.status(400).json({
        error: "userId, amount e description são obrigatórios.",
      });
    }

    console.log("📤 Criando PIX EM LOTE:", {
      bilhetes,
      userId,
      amount,
      description,
    });

    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",
      payer: { email: "test_user@test.com" },
    };

    const resposta = await axios.post(MP_API_URL, pagamento, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
    });

    const data = resposta.data;
    const trx = data?.point_of_interaction?.transaction_data;

    if (!trx) {
      console.error("❌ Mercado Pago não retornou transaction_data:", data);
      return res.status(500).json({
        error: "Mercado Pago não retornou QR Code.",
        details: data,
      });
    }

    // 💾 Cria uma transação por bilhete
    for (const id of bilhetes) {
      await prisma.transacao.create({
        data: {
          userId: BigInt(userId),
          bilheteId: BigInt(id),
          valor: Number(amount) / bilhetes.length, // divide valor
          status: "pending",
          mpPaymentId: String(data.id),
        },
      });
    }

    console.log("💾 Transações criadas para todos os bilhetes.");

    return res.json({
      status: data.status,
      id: data.id,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO AO CRIAR PIX (lote):", err.response?.data || err);
    return res.status(500).json({
      error: "Erro ao criar pagamento PIX em lote",
      details: err.response?.data || err.message,
    });
  }
});

export default router;