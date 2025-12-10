// src/routes/pixwebhook.ts
import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";

const router = Router();

const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;

const MP_API_URL = "https://api.mercadopago.com/v1/payments";

/* ============================================================
   🔥 WEBHOOK OFICIAL DO MERCADO PAGO
   Aqui é onde o pagamento é confirmado
   ============================================================ */
router.post("/", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("⚠️ Webhook recebido sem paymentId.");
      return res.status(200).end();
    }

    // Busca dados do pagamento direto no Mercado Pago
    const { data: pagamento } = await axios.get(`${MP_API_URL}/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    console.log("🔔 WEBHOOK MP → status:", pagamento.status);

    // Apenas se estiver aprovado
    const aprovado =
      pagamento.status === "approved" || pagamento.status === "paid";

    if (!aprovado) return res.status(200).end();

    // Procura TODAS as transações que têm esse mpPaymentId
    // (porque agora uma transação pode pagar vários bilhetes)
    const transacoes = await prisma.transacao.findMany({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacoes || transacoes.length === 0) {
      console.warn("⚠️ Nenhuma transação encontrada para paymentId:", paymentId);
      return res.status(200).end();
    }

    console.log(`🎉 Pagamento aprovado → ${transacoes.length} transações serão liberadas.`);

    // Atualiza todas as transações + bilhetes associados
    for (const trans of transacoes) {
      await prisma.transacao.update({
        where: { id: trans.id },
        data: { status: "paid" },
      });

      await prisma.bilhete.update({
        where: { id: trans.bilheteId },
        data: { pago: true },
      });

      console.log(`✔️ Bilhete liberado: #${trans.bilheteId}`);
    }

    return res.status(200).end();
  } catch (err) {
    console.error("❌ ERRO NO WEBHOOK:", err.response?.data || err);
    return res.status(200).end();
  }
});

export default router;