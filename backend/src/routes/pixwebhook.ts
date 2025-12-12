// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma"; // ✔ caminho FINAL correto

const router = express.Router();

// fetch nativo (Node 18+ / 20+)
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * Webhook PIX — Fluxo Novo
 * - Atualiza bilhetes pagos
 * - Nunca cria bilhetes
 * - Sempre responde 200 (ACK)
 */

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
    return await resp.json();
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

      if (
        (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
        trimmed.startsWith('"')
      ) {
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
      if (Array.isArray((value as any).bilhetes))
        return (value as any).bilhetes.map(String);
      return [];
    }
  } catch {}

  return [];
}

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    // tentar extrair paymentId
    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id ||
      payload?.topicData?.id ||
      null;

    if (!paymentId) {
      console.log("pixWebhook: payload sem paymentId");
      console.debug("preview:", JSON.stringify(payload).slice(0, 1500));
      return res.status(200).send("ok");
    }

    // consulta Mercado Pago
    const mpInfo = await fetchMpPayment(String(paymentId));

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

    // buscar transação
    let txRecord: any = null;
    try {
      txRecord = await prisma.transacao.findFirst({
        where: { mpPaymentId: String(paymentId) },
      });
    } catch {
      txRecord = null;
    }

    // coletar bilhetes
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
      } else if (payload?.metadata) {
        bilhetes = normalizeBilhetesField(payload.metadata);
      } else {
        bilhetes = normalizeBilhetesField(payload.bilhetes);
      }
    } catch {
      bilhetes = [];
    }

    bilhetes = Array.from(new Set(bilhetes.map(String).filter(Boolean)));

    if (!isApproved) {
      console.log("pixWebhook: pagamento NÃO aprovado", {
        paymentId,
        status: mpStatus,
      });
      return res.status(200).send("ok");
    }

    if (bilhetes.length === 0) {
      console.warn("pixWebhook: pagamento aprovado mas sem bilhetes", {
        paymentId,
      });
      return res.status(200).send("ok");
    }

    // atualizar bilhetes
    try {
      const updateResult = await prisma.bilhete.updateMany({
        where: { id: { in: bilhetes.map(Number) } },
        data: {
          pago: true,
        },
      });

      console.log(
        `pixWebhook: paymentId=${paymentId}, bilhetes recebidos=${bilhetes.length}, atualizados=${updateResult.count}`
      );
    } catch (e) {
      console.error("pixWebhook: erro ao atualizar bilhetes:", e);
      return res.status(200).send("ok");
    }

    // marcar transação como paga
    if (txRecord) {
      try {
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: { status: "paid" },
        });
      } catch (e) {
        console.warn("pixWebhook: falha ao atualizar transação", e);
      }
    }

    return res.status(200).send("ok");

  } catch (err) {
    console.error("pixWebhook erro inesperado:", err);
    return res.status(200).send("ok");
  }
});

export default router;