// backend/routes/pixWebhook.ts
const express = require("express");
const router = express.Router();
const { prisma } = require("../prismaClient"); // adapte
const fetch = require("node-fetch");

router.post("/webhook", express.json(), async (req, res) => {
  // Mercado Pago webhook will send event details
  try {
    const payload = req.body;
    // 1) validar evento (opcional: validar signature, topic, etc.)
    // 2) obter payment id do payload ou buscar via API MP
    const payment_id = payload?.data?.id || payload?.id || payload?.payment_id || null;

    if (!payment_id) {
      // Pode haver outros formatos - log e ack
      console.log("webhook sem payment_id", payload);
      return res.status(200).send("ok");
    }

    // 3) consultar MP para obter status (opcional, mas recomendado)
    // const mpResp = await fetch(`${process.env.MP_BASE_URL}/v1/payments/${payment_id}`, { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` } });
    // const mpJson = await mpResp.json();

    // Aqui assumimos pago; na prática verifique mpJson.status === 'approved'
    const status = payload?.type || "approved"; // adapte

    if (status === "payment" || payload?.action === "payment.created" || payload?.topic === "payment") {
      // Busca no DB pelos bilhetes temporários associados a esse payment_id
      // Se você salvou transação antes, associe por payment_id. Caso contrário,
      // utilize a metadata saved earlier or match by user/session.

      // Exemplo: supondo que você tenha saved a 'transaction' com payment_id
      // const tx = await prisma.transaction.findUnique({ where: { paymentId: payment_id } });
      // if (tx) {
      //   // buscar bilhetes na metadata do tx e marcar pago
      //   const bilhetes = tx.metadata?.bilhetes || [];
      //   await prisma.$transaction([
      //     prisma.transaction.update({ where: { id: tx.id }, data: { status: 'paid', paidAt: new Date() } }),
      //     ...bilhetes.map(b => prisma.bilhete.update({ where: { codigo: b }, data: { pago: true, paymentId: payment_id } }))
      //   ]);
      // }

      // Se você não salvou antes, você pode salvar agora: criar bilhetes no DB marcando pago
      // Exemplo genérico (ajuste com seu schema):
      // const bilhetes = payload?.metadata?.bilhetes || [];
      // for (const b of bilhetes) {
      //   await prisma.bilhete.create({ data: { dezenas: b, pago: true, paymentId: payment_id, userId: tx.userId } });
      // }

      console.log("Webhook: marcar bilhetes como pagos para payment_id", payment_id);
    }

    // ack
    res.status(200).send("ok");
  } catch (e) {
    console.error("webhook error", e);
    res.status(500).send("erro");
  }
});

module.exports = router;