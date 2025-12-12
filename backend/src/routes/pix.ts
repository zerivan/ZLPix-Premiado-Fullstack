// backend/src/routes/pix.ts
import express from "express";
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

    // Validar userId (recomendo exigir)
    const uid = typeof userId === "number" ? userId : Number(userId);
    if (!uid || Number.isNaN(uid)) {
      return res.status(400).json({ error: "Payload inválido: userId obrigatório e numérico." });
    }

    // 1) Criar transação pendente (com metadata)
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
      // se a tabela realmente não existir, logue e prossiga (cuidado)
      console.error("Erro ao criar transacao (prisma):", err);
      return res.status(500).json({ error: "Erro ao criar transação no servidor." });
    }

    // 2) Config Mercado Pago
    const mpToken = process.env.MP_ACCESS_TOKEN;
    const mpBase = process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      console.error("MP_ACCESS_TOKEN não configurado");
      return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado no backend" });
    }

    const body = {
      transaction_amount: Number(amount),
      description: description || "Bilhetes ZLPix",
      payment_method_id: "pix",
      metadata: {
        bilhetes,
        txId: txRecord?.id ?? null,
      },
    };

    // 3) Criar pagamento PIX no MP
    const resp = await fetchFn(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let mpJson: any = null;
    try {
      mpJson = await resp.json();
    } catch (err) {
      console.error("Erro ao parsear resposta MP:", err);
      return res.status(502).json({ error: "Resposta inválida do Mercado Pago" });
    }

    if (!resp.ok) {
      console.error("Erro Mercado Pago:", mpJson);
      return res.status(502).json({ error: "Erro ao criar PIX no Mercado Pago", details: mpJson });
    }

    // 4) Extrair dados do MP (tolerante)
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

    // 5) Atualizar transação com mpPaymentId e (se quiser) armazenar response na metadata
    if (txRecord && paymentId) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: {
            mpPaymentId: String(paymentId),
            // opcional: anexar resposta MP nos metadata (atenção ao tamanho)
            metadata: { ...txRecord.metadata, mpResponse: mpJson },
          },
        });
      } catch (err) {
        console.warn("Falha ao atualizar transacao com mpPaymentId:", err);
        // não falhar o fluxo — retornar os dados do MP mesmo assim
      }
    }

    // 6) Resposta para frontend
    return res.json({
      payment_id: paymentId,
      qr_code_base64: qr_base64,
      copy_paste: copia_cola,
      txId: txRecord?.id ?? null,
    });
  } catch (error: any) {
    console.error("Erro /pix/create (catch):", error);
    return res.status(500).json({ error: "Erro interno", details: error?.message || String(error) });
  }
});

export default router;