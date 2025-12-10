import { Router } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma";

const router = Router();
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN_TEST!;
const MP_API_URL = "https://api.mercadopago.com/v1/payments";

router.post("/", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId) return res.status(200).end();

    // Buscar pagamento no Mercado Pago
    const { data: pagamento } = await axios.get(`${MP_API_URL}/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    });

    console.log("Pagamento recebido:", pagamento.status);

    // 🔥 PROCURAR A TRANSAÇÃO CORRETA
    const transacao = await prisma.transacao.findUnique({
      where: { mpPaymentId: paymentId.toString() },
    });

    if (!transacao) {
      console.log("⚠️ Transação não encontrada no banco. Ignorando.");
      return res.status(200).end();
    }

    // 🔥 ATUALIZAR STATUS CORRETO
    if (pagamento.status === "approved") {
      await prisma.transacao.update({
        where: { mpPaymentId: paymentId.toString() },
        data: { status: "aprovado" },
      });

      console.log("🎉 Pagamento aprovado!", transacao.bilheteId);
    }

    return res.status(200).end();
  } catch (err) {
    console.error("Webhook erro:", err);
    return res.status(200).end();
  }
});

export default router;