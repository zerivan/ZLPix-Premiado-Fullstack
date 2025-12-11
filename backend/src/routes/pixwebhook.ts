// backend/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import fetch from "node-fetch"; // ou use global fetch se seu Node suportar
import { prisma } from "../prismaClient"; // ajuste se seu prisma client está em outro caminho

const router = express.Router();

/**
 * Webhook PIX (versão para o fluxo atual)
 * - Montar em server: app.use("/pix", pixWebhookRoutes);
 * - Rota expõe POST "/webhook" se montado como acima,
 *   ou POST "/" se montado como app.use("/pix/webhook", pixWebhookRoutes).
 *
 * Comportamento:
 * - Extrai paymentId de variados formatos de payload
 * - Extrai lista de bilhete IDs (preferencialmente metadata.bilhetes)
 *   - Pode vir em txRecord.metadata, payload.metadata, mpInfo.metadata
 *   - Pode vir como JSON string, array de strings, ou comma-separated
 * - Se pagamento confirmado (mpInfo ou payload indicar paid/approved),
 *   executa updateMany marcando os bilhetes como pago = true e paymentId
 * - NÃO cria bilhetes novos. Não faz upsert. Apenas atualiza registros existentes.
 * - Responde 200 sempre (ack ao MP). Logs ajudam debug.
 */

async function fetchMpPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  const base = process.env.MP_BASE_URL || "https://api.mercadopago.com";
  if (!token) return null;
  try {
    const resp = await fetch(`${base}/v1/payments/${paymentId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (e) {
    console.warn("Erro ao consultar MP:", e);
    return null;
  }
}

function normalizeBilhetesField(value: any): string[] {
  if (!value) return [];
  try {
    // se já for array de strings
    if (Array.isArray(value)) return value.map((v) => String(v));
    // se for string JSON
    if (typeof value === "string") {
      const trimmed = value.trim();
      // tenta parse JSON
      if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.startsWith('"')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        } catch {
          // não era JSON
        }
      }
      // se comma separated
      if (trimmed.includes(",")) {
        return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
      }
      // otherwise single id string
      return [trimmed];
    }
    // se for objeto com campos, tentar coletar valores
    if (typeof value === "object") {
      // tenta extrair array se existir
      if (Array.isArray((value as any).bilhetes)) return (value as any).bilhetes.map((v: any) => String(v));
      return [];
    }
  } catch {
    return [];
  }
  return [];
}

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    // tentar extrair payment id em formatos comuns
    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id ||
      payload?.topicData?.id ||
      (payload?.data && payload.data?.id) ||
      null;

    if (!paymentId) {
      console.log("pixWebhook: recebido payload sem paymentId — ack e log");
      console.debug("payload webhook (preview):", JSON.stringify(payload).slice(0, 2000));
      return res.status(200).send("ok");
    }

    // consultar MP (opcional) para confirmar status
    const mpInfo = await fetchMpPayment(String(paymentId));
    const mpStatus =
      mpInfo?.status ||
      mpInfo?.status_detail ||
      payload?.type ||
      payload?.action ||
      payload?.status ||
      null;

    const isApproved =
      (typeof mpStatus === "string" && (mpStatus.toLowerCase().includes("approved") || mpStatus.toLowerCase().includes("paid"))) ||
      payload?.action === "payment.created" ||
      payload?.topic === "payment" ||
      payload?.type === "payment";

    // tentar encontrar transação no DB (se existir tabela transaction)
    let txRecord: any = null;
    try {
      txRecord = await prisma.transaction.findFirst({
        where: { paymentId: String(paymentId) },
      });
    } catch {
      // tabela transaction pode não existir — seguir fallback
      txRecord = null;
    }

    // coletar bilhetes a partir das fontes possíveis (prioridade):
    // 1) txRecord.metadata.bilhetes
    // 2) payload.metadata.bilhetes
    // 3) mpInfo.metadata.bilhetes
    // 4) payload?.data?.metadata
    let bilhetes: string[] = [];

    try {
      if (txRecord?.metadata && txRecord.metadata.bilhetes) {
        bilhetes = normalizeBilhetesField(txRecord.metadata.bilhetes);
      } else if (payload?.metadata && payload.metadata.bilhetes) {
        bilhetes = normalizeBilhetesField(payload.metadata.bilhetes);
      } else if (payload?.data?.metadata && payload.data.metadata.bilhetes) {
        bilhetes = normalizeBilhetesField(payload.data.metadata.bilhetes);
      } else if (mpInfo?.metadata && mpInfo.metadata.bilhetes) {
        bilhetes = normalizeBilhetesField(mpInfo.metadata.bilhetes);
      } else if (payload?.metadata) {
        // fallback: talvez metadata seja diretamente os ids (ex: metadata: { "bilhetes": "[...]" } handled above)
        // ou metadata itself is an array or string
        bilhetes = normalizeBilhetesField(payload.metadata);
      } else {
        // último recurso: se o payload tiver um campo 'bilhetes' direto
        bilhetes = normalizeBilhetesField(payload.bilhetes || payload.data?.bilhetes);
      }
    } catch (e) {
      bilhetes = [];
    }

    // garantir IDs únicos e válidos
    bilhetes = Array.from(new Set(bilhetes.map((b) => String(b).trim()).filter(Boolean)));

    if (!isApproved) {
      console.log("pixWebhook: evento recebido mas status não indica pagamento aprovado", {
        paymentId,
        status: mpStatus,
        bilhetesCount: bilhetes.length,
      });
      // devolve ack 200 mesmo assim
      return res.status(200).send("ok");
    }

    if (bilhetes.length === 0) {
      // se aprovado mas não achou bilhetes, tentar usar txRecord.metadata (já tentado) — ack e log
      console.warn("pixWebhook: pagamento aprovado mas não foram encontrados bilhetes para atualizar", {
        paymentId,
      });
      return res.status(200).send("ok");
    }

    // atualizar bilhetes existentes marcando pago = true (idempotente)
    try {
      // updateMany para todos os ids recebidos
      const updateResult = await prisma.bilhete.updateMany({
        where: {
          id: { in: bilhetes },
        },
        data: {
          pago: true,
          paymentId: String(paymentId),
        },
      });

      console.log(
        `pixWebhook: paymentId=${paymentId} - bilhetes recebidos=${bilhetes.length} - atualizados=${updateResult.count}`
      );

      // Se alguns IDs não foram encontrados (updateResult.count < bilhetes.length), logue para análise
      if (updateResult.count < bilhetes.length) {
        const notFound = [];
        for (const id of bilhetes) {
          const exists = await prisma.bilhete.findUnique({ where: { id } });
          if (!exists) notFound.push(id);
        }
        if (notFound.length) {
          console.warn("pixWebhook: alguns bilhetes não foram encontrados no DB:", notFound);
        }
      }
    } catch (e) {
      console.error("pixWebhook: falha ao atualizar bilhetes:", e);
      // Não criar nada, apenas logar e ack
      return res.status(200).send("ok");
    }

    // marcar transação como paga (se existir)
    if (txRecord) {
      try {
        await prisma.transaction.update({
          where: { id: txRecord.id },
          data: { status: "paid", paidAt: new Date() },
        });
      } catch (e) {
        console.warn("pixWebhook: falha ao atualizar transaction status:", e);
      }
    }

    // ack
    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook unexpected error:", err);
    return res.status(200).send("ok");
  }
});

export default router;