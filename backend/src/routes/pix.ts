// backend/routes/pix.ts
import express from "express";
import fetch from "node-fetch";
import { prisma } from "../prismaClient";

const router = express.Router();

/*
IMPORTANTE:
Este módulo está ajustado para o fluxo NOVO:

✔ Recebe vários bilhetes em uma única compra
✔ Cria UMA transação PIX no Mercado Pago
✔ Envia metadata com todos os bilhetes
✔ Retorna qr_code_base64 e copy_paste
✔ Não altera schema Prisma
✔ Funciona com o webhook atual
*/

router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (!amount || !bilhetes || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Payload inválido: amount e bilhetes são obrigatórios." });
    }

    //----------------------------------------------------------
    // 1️⃣ Criar transação PENDENTE no banco (sem alterar schema)
    //----------------------------------------------------------
    let txRecord = null;

    try {
      txRecord = await prisma.transaction.create({
        data: {
          userId: userId ?? null,
          amount: Number(amount),
          status: "pending",
          metadata: { bilhetes },
        },
      });
    } catch (err) {
      console.warn("⚠️ Tabela transaction pode não existir. Continuando sem ela.");
    }

    //----------------------------------------------------------
    // 2️⃣ Preparar chamada ao Mercado Pago
    //----------------------------------------------------------
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const mpBase = process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      console.error("❌ MP_ACCESS_TOKEN não configurado.");
      return res.status(500).json({ error: "Backend não configurado com MP_ACCESS_TOKEN" });
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

    //----------------------------------------------------------
    // 3️⃣ Criar pagamento PIX no Mercado Pago
    //----------------------------------------------------------
    const resp = await fetch(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const mpJson = await resp.json();

    if (!resp.ok) {
      console.error("❌ Erro Mercado Pago:", mpJson);
      return res.status(500).json({ error: "Erro ao criar PIX", details: mpJson });
    }

    //----------------------------------------------------------
    // 4️⃣ Extrair dados do pagamento
    //----------------------------------------------------------
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

    //----------------------------------------------------------
    // 5️⃣ Atualizar transaction no banco (se existir)
    //----------------------------------------------------------
    if (txRecord && paymentId) {
      try {
        await prisma.transaction.update({
          where: { id: txRecord.id },
          data: { paymentId },
        });
      } catch {}
    }

    //----------------------------------------------------------
    // 6️⃣ Retornar para o front
    //----------------------------------------------------------
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