// src/routes/pixwebhook.ts
import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";

const router = Router();
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN_TEST || process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MP_API_URL = "https://api.mercadopago.com/v1/payments";

router.post("/", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId) return res.status(200).end();

    const { data: pagamento } = await axios.get(`${MP_API_URL}/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    console.log("Pagamento recebido:", pagamento.status);

    if (pagamento.status === "approved" || pagamento.status === "paid") {
      // encontra transacao
      const trans = await prisma.transacao.findFirst({
        where: { mpPaymentId: String(paymentId) },
      });

      if (!trans) {
        console.warn("Transação não encontrada para mpPaymentId:", paymentId);
        return res.status(200).end();
      }

      await prisma.transacao.update({
        where: { id: trans.id },
        data: { status: "paid" },
      });

      // libera bilhete
      await prisma.bilhete.update({
        where: { id: trans.bilheteId },
        data: { pago: true },
      });

      console.log("🎉 Bilhete liberado automaticamente:", trans.bilheteId);
    }

    return res.status(200).end();
  } catch (err) {
    console.error("Webhook erro:", err);
    return res.status(200).end();
  }
});

export default router;