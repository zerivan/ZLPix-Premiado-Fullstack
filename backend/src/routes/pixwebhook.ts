// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo (Node 18+ / 20+)
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * Busca info do Mercado Pago (se token estiver disponível)
 */
async function fetchMpPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  const base = process.env.MP_BASE_URL || "https://api.mercadopago.com";
  if (!token) return null;

  try {
    const resp = await fetchFn(`${base}/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) {
      console.warn("fetchMpPayment: resp not ok", resp.status);
      return null;
    }
    const data: any = await resp.json();
    return data;
  } catch (e) {
    console.warn("Erro ao consultar Mercado Pago:", e);
    return null;
  }
}

/**
 * Normaliza o campo 'bilhetes' para array de strings (ids)
 */
function normalizeBilhetesField(value: any): string[] {
  if (!value) return [];

  try {
    // já é array
    if (Array.isArray(value)) return value.map(String);

    // string: pode ser JSON, CSV, ou uma id simples
    if (typeof value === "string") {
      const trimmed = value.trim();

      // JSON string -> parse
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith('"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
          // segue para outras tentativas
        }
      }

      // CSV
      if (trimmed.includes(",")) {
        return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }

      // string única
      return [trimmed];
    }

    // objeto: procurar propriedade bilhetes
    if (typeof value === "object") {
      if (Array.isArray((value as any).bilhetes)) return (value as any).bilhetes.map(String);
      return [];
    }
  } catch (e) {
    // swallow
  }

  return [];
}

/**
 * Webhook handler
 * - sempre responde 200 (ACK)
 * - tenta marcar bilhetes como pagos quando pagamento aprovado
 */
router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

    // tentar extrair paymentId de várias formas
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
      console.log("pixWebhook: payload sem paymentId (ignorando). preview:", JSON.stringify(payload).slice(0, 800));
      return res.status(200).send("ok");
    }

    // consulta Mercado Pago (se possível)
    const mpInfo: any = await fetchMpPayment(String(paymentId));

    // determinar status do pagamento (vários lugares possíveis)
    const mpStatus =
      mpInfo?.status ||
      mpInfo?.status_detail ||
      payload?.type ||
      payload?.action ||
      payload?.status ||
      payload?.data?.status ||
      null;

    const isApproved =
      (typeof mpStatus === "string" &&
        (mpStatus.toLowerCase().includes("approved") || mpStatus.toLowerCase().includes("paid"))) ||
      payload?.action === "payment.created" ||
      payload?.topic === "payment" ||
      payload?.type === "payment";

    // buscar transação associada (se existir)
    let txRecord: any = null;
    try {
      txRecord = await prisma.transacao.findFirst({
        where: { mpPaymentId: String(paymentId) },
      });
    } catch (e) {
      console.warn("pixWebhook: erro ao buscar transacao:", e);
      txRecord = null;
    }

    // coletar bilhetes (vários lugares)
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
        // talvez metadata venha inteiro como string/json
        bilhetes = normalizeBilhetesField(payload.metadata);
      } else if (payload?.data?.metadata) {
        bilhetes = normalizeBilhetesField(payload.data.metadata);
      } else if (payload?.data?.object?.metadata) {
        bilhetes = normalizeBilhetesField(payload.data.object.metadata);
      }
    } catch (e) {
      console.warn("pixWebhook: falha ao extrair bilhetes:", e);
      bilhetes = [];
    }

    // normalizar e filtrar ids válidos (somente números)
    const numericBilhetes = Array.from(
      new Set(
        bilhetes
          .map((b) => {
            const n = Number(String(b).trim());
            return Number.isFinite(n) ? n : null;
          })
          .filter((x) => x !== null)
      )
    ) as number[];

    if (!isApproved) {
      console.log("pixWebhook: pagamento NÃO aprovado", { paymentId, status: mpStatus });
      return res.status(200).send("ok");
    }

    if (numericBilhetes.length === 0) {
      console.warn("pixWebhook: pagamento aprovado mas sem bilhetes válidos a atualizar", { paymentId, extracted: bilhetes });
      // marcar transacao como paid mesmo assim (se quiser)
      if (txRecord) {
        try {
          await prisma.transacao.update({
            where: { id: txRecord.id },
            data: { status: "paid" },
          });
        } catch (e) {
          console.warn("pixWebhook: falha ao marcar transacao como paid:", e);
        }
      }
      return res.status(200).send("ok");
    }

    // atualizar bilhetes (marca pago = true)
    try {
      const updateResult = await prisma.bilhete.updateMany({
        where: { id: { in: numericBilhetes } },
        data: { pago: true },
      });

      console.log(`pixWebhook: paymentId=${paymentId}, bilhetes_recebidos=${numericBilhetes.length}, atualizados=${updateResult.count}`);
    } catch (e) {
      console.error("pixWebhook: erro ao atualizar bilhetes:", e);
      return res.status(200).send("ok");
    }

    // atualizar transacao (status e mpPaymentId) se existir
    if (txRecord) {
      try {
        const updateData: any = { status: "paid" };
        if (!txRecord.mpPaymentId) updateData.mpPaymentId = String(paymentId);
        await prisma.transacao.update({
          where: { id: txRecord.id },
          data: updateData,
        });
      } catch (e) {
        console.warn("pixWebhook: falha ao atualizar transacao:", e);
      }
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook erro inesperado:", err);
    // responder 200 para ACK — mas registramos o erro
    return res.status(200).send("ok");
  }
});

export default router;