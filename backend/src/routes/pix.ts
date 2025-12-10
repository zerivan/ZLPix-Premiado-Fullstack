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

// ======================
// 🔥 ROTA PARA CRIAR PIX
// ======================
router.post("/create", async (req, res) => {
  try {
    const { amount, description, bilheteId } = req.body;

    if (!amount || !description || !bilheteId) {
      return res.status(400).json({
        error: "amount, description e bilheteId são obrigatórios.",
      });
    }

    console.log("📤 Criando PIX:", { amount, description, bilheteId });

    // 🔥 Mercado Pago exige isso
    const idempotencyKey = crypto.randomUUID();

    const pagamento = {
      transaction_amount: Number(amount),
      description,
      payment_method_id: "pix",
      payer: {
        email: "test_user@test.com",
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
      console.error("❌ Mercado Pago não retornou transaction_data:", data);
      return res.status(500).json({
        error: "Mercado Pago não retornou QR Code.",
        details: data,
      });
    }

    // 🔥 SALVAR TRANSAÇÃO NO BANCO (CORRIGIDO)
    await prisma.transacao.create({
      data: {
        bilheteId: Number(bilheteId), // 🔥 CORREÇÃO AQUI!
        mpPaymentId: String(data.id),
        status: "pendente",
      },
    });

    console.log("💾 Transação salva no banco:", data.id);

    return res.json({
      status: data.status,
      id: data.id,
      qr_code: trx.qr_code,
      qr_code_base64: trx.qr_code_base64,
      copy_paste: trx.qr_code,
    });
  } catch (err: any) {
    console.log("❌ ERRO COMPLETO AO CRIAR PIX:");
    console.log("Mensagem:", err.message);
    console.log("Detalhes:", err.response?.data);

    return res.status(500).json({
      error: "Erro ao criar pagamento PIX",
      details: err.response?.data || err.message,
    });
  }
});

export default router;