import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

async function fetchMpPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  const base = process.env.MP_BASE_URL || "https://api.mercadopago.com";
  if (!token) return null;

  try {
    const resp = await fetchFn(`${base}/v1/payments/${paymentId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) return null;
    const data: any = await resp.json();
    return data;

  } catch (e) {
    console.warn("Erro ao consultar Mercado Pago:", e);
    return null;
  }
}

function normalizeBilhetesField(value: any): string[] {
  if (!value) return [];
  try {
    if (Array.isArray(value)) return value.map(String);

    if (typeof value === "string") {
      const trimmed = value.trim();
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith('"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch {}
      }
      if (trimmed.includes(",")) {
        return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }
      return [trimmed];
    }

    if (typeof value === "object") {
      if (Array.isArray(value.bilhetes)) return value.bilhetes.map(String);
      return [];
    }
  } catch {}
  return [];
}

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id ||
      payload?.topicData?.id ||
      null;

    if (!paymentId) {
      console.log("pixWebhook: payload sem paymentId");
      return res.status(200).send("ok");
    }

    const mpInfo: any = await fetchMpPayment(String(paymentId));

    const mpStatus =
      mpInfo?.status ||
      mpInfo?.status_detail ||
      payload?.type ||
      payload?.action ||
      payload?.status ||
      null;

    const isApproved =
      (typeof mpStatus === "string" &&
        (mpStatus.toLowerCase().includes("approved") ||
         mpStatus.toLowerCase().includes("paid"))) ||
      payload?.action === "payment.created" ||
      payload?.topic === "payment";

    let txRecord: any = null;
    try {
      txRecord = await prisma.transacao.findFirst({
        where: { mpPaymentId: String(paymentId) },
      });
    } catch {}

    let bilhetes: string[] = [];

    try {
      if (txRecord?.metadata?.bilhetes) {
        bilhetes = normalizeBilhetesField(txRecord.metadata.bilhetes);
      } else if (payload?.metadata?.bilhetes) {
        bilhetes = normalizeBilhetesField(payload.metadata.bilhetes);
      } else if (payload?.data?.metadata?.bilhetes) {
        bilhetes = normalizeBilhetesField(payload.data.metadata.bilhetes);
      } else if (mpInfo?.metadata?.bilhetes) {
        bilhetes = normalizeBilhetesField(mpInfo.metadata.bilhetes);
      }
    } catch {}

    bilhetes = Array.from(new Set(bilhetes.map(String).filter(Boolean)));

    if (!isApproved) {
      console.log("Pagamento NÃO aprovado:", { paymentId, status: mpStatus });
      return res.status(200).send("ok");
    }

    if (bilhetes.length === 0) {
      console.warn("Pagamento aprovado sem bilhetes:", { paymentId });
      return res.status(200).send("ok");
    }

    await prisma.bilhete.updateMany({
      where: { id: { in: bilhetes.map(Number) } },
      data: { pago: true },
    });

    if (txRecord) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: { status: "paid" },
        });
      } catch {}
    }

    return res.status(200).send("ok");

  } catch (err) {
    console.error("Erro inesperado webhook:", err);
    return res.status(200).send("ok");
  }
});

export default router;
