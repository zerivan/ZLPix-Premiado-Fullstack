// backend/src/routes/pix.ts
import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    // Validações básicas
    if (!amount || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({
        error: "Payload inválido: 'amount' e 'bilhetes' são obrigatórios.",
      });
    }

    // Validar userId (obrigatório e numérico)
    const uid = typeof userId === "number" ? userId : Number(userId);
    if (!uid || Number.isNaN(uid)) {
      return res
        .status(400)
        .json({ error: "Payload inválido: userId obrigatório e numérico." });
    }

    // 🔎 Buscar usuário no banco
    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: {
        email: true,
        name: true,
        phone: true,
      },
    });

    if (!user || !user.email) {
      return res.status(400).json({
        error: "Usuário não encontrado ou sem email cadastrado.",
      });
    }

    // 1️⃣ Criar transação pendente
    let txRecord: any = null;
    try {
      txRecord = await prisma.transacao.create({
        data: {
          userId: uid,
          valor: Number(amount),
          status: "pending",
          mpPaymentId: null,
          metadata: { bilhetes },
        },
      });
    } catch (err) {
      console.error("Erro ao criar transacao (prisma):", err);
      return res
        .status(500)
        .json({ error: "Erro ao criar transação no servidor." });
    }

    // 2️⃣ Config Mercado Pago
    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    const mpBase =
      process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      console.error("MP_ACCESS_TOKEN não configurado");
      return res
        .status(500)
        .json({ error: "MP_ACCESS_TOKEN não configurado no backend" });
    }

    // 3️⃣ Payload Mercado Pago
    const body = {
      transaction_amount: Number(amount),
      description: description || "Bilhetes ZLPix",
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name || "Cliente",
      },
      metadata: {
        bilhetes,
        txId: txRecord?.id ?? null,
        userId: uid,
      },
    };

    const idempotencyKey = crypto.randomUUID();

    // 4️⃣ Criar pagamento PIX
    const resp = await fetchFn(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    let mpJson: any = null;
    try {
      mpJson = await resp.json();
    } catch (err) {
      console.error("Erro ao parsear resposta MP:", err);
      return res
        .status(502)
        .json({ error: "Resposta inválida do Mercado Pago" });
    }

    if (!resp.ok) {
      console.error("Erro Mercado Pago:", mpJson);
      return res.status(502).json({
        error: "Erro ao criar PIX no Mercado Pago",
        details: mpJson,
      });
    }

    // 5️⃣ Extrair dados
    const paymentId =
      mpJson.id ||
      mpJson.payment_id ||
      mpJson.data?.id ||
      null;

    const qr_base64 =
      mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ||
      null;

    const copia_cola =
      mpJson.point_of_interaction?.transaction_data?.qr_code ||
      mpJson.qr_code ||
      null;

    // 6️⃣ Atualizar transação com mpPaymentId
    if (txRecord && paymentId) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: {
            mpPaymentId: String(paymentId),
            metadata: {
              ...txRecord.metadata,
              mpResponse: mpJson,
            },
          },
        });
      } catch (err) {
        console.warn(
          "Falha ao atualizar transacao com mpPaymentId:",
          err
        );
      }
    }

    // 7️⃣ Resposta ao frontend
    return res.json({
      payment_id: paymentId,
      qr_code_base64: qr_base64,
      copy_paste: copia_cola,
      txId: txRecord?.id ?? null,
    });
  } catch (error: any) {
    console.error("Erro /pix/create:", error);
    return res.status(500).json({
      error: "Erro interno",
      details: error?.message || String(error),
    });
  }
});

// =====================================================
// 📌 STATUS DO PAGAMENTO (FONTE ÚNICA DA VERDADE)
// =====================================================
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ status: "INVALID" });
    }

    const tx = await prisma.transacao.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
      select: {
        status: true,
      },
    });

    if (!tx) {
      // Transação ainda não conciliada
      return res.json({ status: "PENDING" });
    }

    if (tx.status === "paid") {
      return res.json({ status: "PAID" });
    }

    return res.json({ status: "PENDING" });
  } catch (err) {
    console.error("Erro payment-status:", err);
    return res.status(500).json({ status: "ERROR" });
  }
});

export default router;