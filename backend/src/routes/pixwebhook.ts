// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo (Node 18+ / 20+)
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * Busca info do Mercado Pago
 */
async function fetchMpPayment(paymentId: string) {
  const token =
    process.env.MP_ACCESS_TOKEN ||
    process.env.MP_ACCESS_TOKEN_TEST;

  const base =
    process.env.MP_BASE_URL || "https://api.mercadopago.com";

  if (!token) return null;

  try {
    const resp = await fetchFn(
      `${base}/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!resp.ok) {
      console.warn("pixWebhook: MP response not ok", resp.status);
      return null;
    }

    return await resp.json();
  } catch (e) {
    console.warn("pixWebhook: erro ao consultar MP:", e);
    return null;
  }
}

/**
 * Webhook PIX
 * - ACK sempre 200
 * - Fonte da verdade: transacao -> userId
 * - Marca TODOS os bilhetes pendentes do usuário como pagos
 */
router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

    // Extrair paymentId de forma tolerante
    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id ||
      payload?.topicData?.id ||
      payload?.data?.object?.id ||
      payload?.data?.payment?.id ||
      null;

    if (!paymentId) {
      console.log(
        "pixWebhook: payload sem paymentId (ignorado)",
        JSON.stringify(payload).slice(0, 600)
      );
      return res.status(200).send("ok");
    }

    // Consultar Mercado Pago
    const mpInfo: any = await fetchMpPayment(String(paymentId));

    const mpStatus: string | null =
      mpInfo?.status ||
      payload?.data?.status ||
      payload?.status ||
      null;

    if (mpStatus !== "approved") {
      console.log("pixWebhook: pagamento não aprovado", {
        paymentId,
        status: mpStatus,
      });
      return res.status(200).send("ok");
    }

    // Buscar transação pelo mpPaymentId
    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacao) {
      console.warn("pixWebhook: transacao não encontrada", paymentId);
      return res.status(200).send("ok");
    }

    // Evitar reprocessamento
    if (transacao.status === "paid") {
      console.log("pixWebhook: transacao já processada", {
        paymentId,
        transacaoId: transacao.id,
      });
      return res.status(200).send("ok");
    }

    // Marcar transação como paga
    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "paid" },
    });

    // 🔥 MARCA TODOS OS BILHETES PENDENTES DO USUÁRIO
    const updateResult = await prisma.bilhete.updateMany({
      where: {
        userId: transacao.userId,
        pago: false,
      },
      data: {
        pago: true,
      },
    });

    console.log("pixWebhook: pagamento confirmado", {
      paymentId,
      userId: transacao.userId,
      bilhetesAtualizados: updateResult.count,
    });

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook: erro inesperado", err);
    // ACK sempre 200 para não gerar retry infinito
    return res.status(200).send("ok");
  }
});

export default router;