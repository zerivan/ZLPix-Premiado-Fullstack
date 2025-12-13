// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

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
 * - Bilhetes são CRIADOS somente após pagamento aprovado
 */
router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

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
      return res.status(200).send("ok");
    }

    const mpInfo: any = await fetchMpPayment(String(paymentId));
    const mpStatus: string | null =
      mpInfo?.status ||
      payload?.data?.status ||
      payload?.status ||
      null;

    if (mpStatus !== "approved") {
      return res.status(200).send("ok");
    }

    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacao) {
      console.warn("pixWebhook: transacao não encontrada", paymentId);
      return res.status(200).send("ok");
    }

    if (transacao.status === "paid") {
      return res.status(200).send("ok");
    }

    // ✅ CAST SEGURO DO METADATA
    const metadata =
      transacao.metadata && typeof transacao.metadata === "object"
        ? (transacao.metadata as Prisma.JsonObject)
        : null;

    const bilhetesMeta = Array.isArray(metadata?.bilhetes)
      ? metadata.bilhetes
      : [];

    // 🔥 CRIAR BILHETES APÓS PAGAMENTO
    for (const b of bilhetesMeta) {
      await prisma.bilhete.create({
        data: {
          dezenas: String(b.dezenas),
          valor: Number(b.valor),
          pago: true,
          transacao: {
            connect: { id: transacao.id },
          },
          user: {
            connect: { id: transacao.userId },
          },
        },
      });
    }

    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "paid" },
    });

    console.log("pixWebhook: pagamento confirmado", {
      paymentId,
      bilhetesCriados: bilhetesMeta.length,
    });

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook: erro inesperado", err);
    return res.status(200).send("ok");
  }
});

export default router;