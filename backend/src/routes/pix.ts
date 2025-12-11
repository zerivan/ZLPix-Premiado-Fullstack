// src/routes/pix.ts
import { Router } from "express";
import axios from "axios";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

/* ============================================================
   🔥 PIX ÚNICO COM DESCRIÇÃO DETALHADA DOS BILHETES
   ============================================================ */
router.post("/create", async (req, res) => {
  try {
    const { userId, amount, descricao } = req.body;

    if (!userId || !amount || !descricao) {
      return res.status(400).json({
        error: "userId, amount e descricao são obrigatórios.",
      });
    }

    console.log("📤 Criando pagamento PIX único:", { userId, amount });

    // pega dados do usuário
    const user = await prisma.users.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado." });
    }

    const idempotencyKey = crypto.randomUUID();

    // 🧾 DESCRIÇÃO VEM PRONTA DO FRONT: lista de bilhetes + total
    const pagamento = {
      transaction_amount: Number(amount),
      description: descricao,
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name,
        phone: {
          area_code: user.phone?.slice(0, 2) || "00",
          number: user.phone?.slice(2) || "000000000",
        },
      },
    };

    // chama MP
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

    // 🔥 SALVA APENAS UMA TRANSAÇÃO
    await prisma.transacao.create({
      data: {
        userId: BigInt(userId),
        valor: Number(amount),
        status: "pending",
        mpPaymentId: String(data.id),
      },
    });

    console.log("💾 Transação registrada:", data.id);

    return res.json({
      status: data.status,
      id: data.id,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO AO CRIAR PIX:", err.response?.data || err);
    return res.status(500).json({
      error: "Erro ao criar pagamento PIX",
      details: err.response?.data || err.message,
    });
  }
});

export default router;