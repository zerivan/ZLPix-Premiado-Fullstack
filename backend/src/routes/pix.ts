// backend/routes/pix.ts
import express from "express";
import { prisma } from "../prisma/prismaclient";  // ✔ caminho corrigido (novo arquivo)
const router = express.Router();

/*
IMPORTANTE:
Fluxo NOVO:

✔ Vários bilhetes em uma única compra
✔ Uma única transação PIX
✔ Metadata com lista de bilhetes
✔ Retorno: qr_code_base64 + copy_paste
✔ Compatível com webhook atual
*/

// fetch nativo do Node 18+ / 20+
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (!amount || !bilhetes || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Payload inválido: amount e bilhetes são obrigatórios." });
    }

    //----------------------------------------------------------
    // 1️⃣ Criar transação PENDENTE no banco
    //----------------------------------------------------------
    let txRecord = null;

    try {
      txRecord = await prisma.transacao.create({
        data: {
          userId: userId ?? null,
          valor: Number(amount),
          status: "pending",
          mpPaymentId: null,
          bilheteId: null,
        },
      });
    } catch (err) {
      console.warn("⚠️ Tabela transacao pode não existir. Continuando sem ela.");
    }

    //----------------------------------------------------------
    // 2️⃣ Chamada ao Mercado Pago
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
    // 3️⃣ Criar pagamento PIX no MP
    //----------------------------------------------------------
    const resp = await fetchFn(`${mpBase}/v1/payments`, {
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
    // 5️⃣ Atualizar transacao (se existir)
    //----------------------------------------------------------
    if (txRecord && paymentId) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: { mpPaymentId: paymentId },
        });
      } catch {}
    }

    //----------------------------------------------------------
    // 6️⃣ Retornar pro Front
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