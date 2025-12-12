import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (!amount || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Payload inválido: amount e bilhetes são obrigatórios." });
    }

    // 1️⃣ Criar transação pendente
    let txRecord = null;

    try {
      txRecord = await prisma.transacao.create({
        data: {
          userId: userId ?? null,
          valor: Number(amount),
          status: "pending",
          mpPaymentId: null
        },
      });
    } catch (_err) {
      console.warn("⚠️ Tabela transacao não existe. Continuando sem salvar transação.");
    }

    // 2️⃣ Chamada Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const mpBase = process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado no backend" });
    }

    const body = {
      transaction_amount: Number(amount),
      description: description || "Bilhetes ZLPix",
      payment_method_id: "pix",
      metadata: {
        bilhetes,
        txId: txRecord?.id || null,
      },
    };

    // 3️⃣ Criar pagamento PIX
    const resp = await fetchFn(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const mpJson: any = await resp.json(); // <-- corrigido

    if (!resp.ok) {
      console.error("❌ Erro Mercado Pago:", mpJson);
      return res.status(500).json({ error: "Erro ao criar PIX", details: mpJson });
    }

    // 4️⃣ Dados do pagamento
    const paymentId =
      mpJson.id ||
      mpJson.payment_id ||
      mpJson.data?.id ||
      null;

    const qr_base64 =
      mpJson.point_of_interaction?.transaction_data?.qr_code_base64 || null;

    const copia_cola =
      mpJson.point_of_interaction?.transaction_data?.qr_code ||
      mpJson.qr_code ||
      null;

    // 5️⃣ Atualizar transação
    if (txRecord && paymentId) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: { mpPaymentId: paymentId },
        });
      } catch {}
    }

    // 6️⃣ Retorno
    return res.json({
      payment_id: paymentId,
      qr_code_base64: qr_base64,
      copy_paste: copia_cola,
    });

  } catch (error: any) {
    console.error("Erro /pix/create:", error);
    return res.status(500).json({ error: "Erro interno", details: error.message });
  }
});

export default router;
