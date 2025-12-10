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

/* ============================================================
   🔥 FUNÇÃO AUXILIAR: pega dados reais do usuário no banco
   ============================================================ */
async function getUserData(userId: string | number) {
  return prisma.users.findUnique({
    where: { id: BigInt(String(userId)) },
  });
}

/* ============================================================
   🔥 ROTA 1 — PIX INDIVIDUAL (1 bilhete)
   ============================================================ */
router.post("/create", async (req, res) => {
  try {
    const { amount, description, bilheteId, userId } = req.body;

    if (!amount || !description || !bilheteId || !userId) {
      return res.status(400).json({
        error: "amount, description, bilheteId e userId são obrigatórios.",
      });
    }

    const user = await getUserData(userId);
    if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

    console.log("📤 Criando PIX (1 bilhete):", { amount, description, bilheteId });

    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",

      // 👇 AGORA COM DADOS REAIS DO USUÁRIO
      payer: {
        email: user.email,
        first_name: user.name,
        phone: {
          area_code: user.phone?.slice(0, 2) || "00",
          number: user.phone?.slice(2) || "000000000",
        },
      },
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

/* ============================================================
   🔥 ROTA 2 — PIX EM LOTE (multi-bilhetes)
   ============================================================ */
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

    const user = await getUserData(userId);
    if (!user) return res.status(400).json({ error: "Usuário não encontrado." });

    console.log("📤 Criando PIX EM LOTE:", { bilhetes, amount, description });

    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",

      // 🔥 PAGADOR REAL
      payer: {
        email: user.email,
        first_name: user.name,
        phone: {
          area_code: user.phone?.slice(0, 2) || "00",
          number: user.phone?.slice(2) || "000000000",
        },
      },
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

    // 🔥 Cria uma transação para cada bilhete
    for (const id of bilhetes) {
      await prisma.transacao.create({
        data: {
          userId: BigInt(userId),
          bilheteId: BigInt(id),
          valor: Number(amount) / bilhetes.length,
          status: "pending",
          mpPaymentId: String(data.id), // mesmo pagamento → lote
        },
      });
    }

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