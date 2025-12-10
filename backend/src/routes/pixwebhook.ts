// src/routes/pixwebhook.ts
import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";

const router = Router();
const MP_ACCESS_TOKEN =
  process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_API_URL = "https://api.mercadopago.com/v1/payments";

router.post("/", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId) return res.status(200).end();

    console.log("🔔 Webhook recebido para pagamento:", paymentId);

    // Consulta pagamento no Mercado Pago
    const { data: pagamento } = await axios.get(`${MP_API_URL}/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    console.log("📡 Status Mercado Pago:", pagamento.status);

    if (pagamento.status === "approved" || pagamento.status === "paid") {
      // 🔎 AGORA BUSCA TODAS AS TRANSAÇÕES DO LOTE
      const transacoes = await prisma.transacao.findMany({
        where: { mpPaymentId: String(paymentId) },
      });

      if (transacoes.length === 0) {
        console.warn("⚠️ Nenhuma transação encontrada para mpPaymentId:", paymentId);
        return res.status(200).end();
      }

      console.log(`📦 Lote encontrado — total de ${transacoes.length} bilhete(s)`);

      // 🔄 Atualiza todas as transações
      await prisma.transacao.updateMany({
        where: { mpPaymentId: String(paymentId) },
        data: { status: "paid" },
      });

      // 🔥 Libera todos os bilhetes do lote
      const bilhetesIds = transacoes.map((t) => t.bilheteId);

      await prisma.bilhete.updateMany({
        where: { id: { in: bilhetesIds } },
        data: { pago: true },
      });

      console.log("🎉 Todos os bilhetes liberados:", bilhetesIds);
    }

    return res.status(200).end();
  } catch (err) {
    console.error("❌ ERRO NO WEBHOOK:", err?.response?.data || err);
    return res.status(200).end(); // Mercado Pago exige 200 OK SEM ERRO
  }
});

export default router;