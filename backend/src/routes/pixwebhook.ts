// backend/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import fetch from "node-fetch"; // ou use global fetch se seu Node suportar
import { prisma } from "../prismaClient"; // ajuste se seu prisma client está em outro caminho

const router = express.Router();

/**
 * Webhook de confirmação de pagamento (Mercado Pago)
 * - Deve ser montado em: app.use("/pix/webhook", pixWebhookRoutes)
 * - Rota expõe POST "/" para que o endpoint final seja /pix/webhook
 *
 * Comportamento:
 * - Extrai payment_id do payload (vários formatos tentados)
 * - (Opcional) consulta MP para confirmar status se MP token estiver configurado
 * - Procura transação salva no BD (se existir) por paymentId
 * - Marca transação como paga e cria/atualiza bilhetes relacionados como `pago = true`
 * - É idempotente: se bilhete já estiver marcado, ignora
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

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};

    // Extrair payment id de formas possíveis
    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id ||
      payload?.topicData?.id ||
      null;

    if (!paymentId) {
      console.log("pixWebhook: sem payment id no payload, salvando log e ack.");
      console.debug("payload webhook:", JSON.stringify(payload).slice(0, 2000));
      return res.status(200).send("ok"); // ack para MP (evita reenvio)
    }

    // Opcional: consultar MP para confirmar status real
    const mpInfo = await fetchMpPayment(String(paymentId));
    const mpStatus =
      mpInfo?.status ||
      mpInfo?.status_detail ||
      payload?.type ||
      payload?.action ||
      payload?.status ||
      null;

    // Considerar aprovado se mpInfo.status === 'approved' ou payload indicar pagamento
    const isApproved =
      String(mpStatus).toLowerCase().includes("approved") ||
      String(mpStatus).toLowerCase().includes("paid") ||
      payload?.action === "payment.created" ||
      payload?.topic === "payment";

    // Buscar transação no DB por paymentId (se houver tabela transaction)
    let txRecord: any = null;
    try {
      txRecord = await prisma.transaction.findFirst({
        where: { paymentId: String(paymentId) },
      });
    } catch (e) {
      // Se não existir tabela transaction no schema, seguir para fallback
    }

    // Extrair lista de bilhetes a processar:
    // 1) Preferir metadata da transação salva (txRecord.metadata.bilhetes)
    // 2) Senão, tentar metadata no payload do webhook (payload?.metadata?.bilhetes)
    // 3) Senão, tentar mpInfo.metadata
    let bilhetes: string[] = [];

    try {
      if (txRecord?.metadata?.bilhetes && Array.isArray(txRecord.metadata.bilhetes)) {
        bilhetes = txRecord.metadata.bilhetes;
      } else if (payload?.metadata?.bilhetes && Array.isArray(payload.metadata.bilhetes)) {
        bilhetes = payload.metadata.bilhetes;
      } else if (mpInfo?.metadata?.bilhetes && Array.isArray(mpInfo.metadata.bilhetes)) {
        bilhetes = mpInfo.metadata.bilhetes;
      }
    } catch (e) {
      bilhetes = [];
    }

    // Se pagamento aprovado, marcar bilhetes como pagos
    if (isApproved) {
      // Se houver transação armazenada, atualize status
      if (txRecord) {
        try {
          await prisma.transaction.update({
            where: { id: txRecord.id },
            data: { status: "paid", paidAt: new Date() },
          });
        } catch (e) {
          console.warn("pixWebhook: falha ao atualizar transaction:", e);
        }
      }

      // Se houver bilhetes, criar ou atualizar no BD marcando pago
      if (Array.isArray(bilhetes) && bilhetes.length) {
        // Operação idempotente: se já existe bilhete com mesmas dezenas e paymentId, evita duplicata
        const ops = bilhetes.map((b) => {
          // Ajuste conforme seu schema: aqui assumimos que `dezenas` é string única.
          // Se existe campo `codigo` ou outro identificador, adapte.
          return prisma.bilhete.upsert({
            where: { /* tentativa de chave única — ajuste conforme schema */ id: `${String(paymentId)}_${b}` }, 
            // NOTE: se não existir chave composta no schema, esse upsert pode falhar.
            // Para compatibilidade, tentamos criar com create, mas se sem key unique, use create.
            create: {
              dezenas: b,
              pago: true,
              userId: payload?.metadata?.userId ?? txRecord?.userId ?? null,
              paymentId: String(paymentId),
              // createdAt será setado automaticamente pelo Prisma se estiver no schema
            },
            update: {
              pago: true,
              paymentId: String(paymentId),
            },
          });
        });

        try {
          await prisma.$transaction(ops);
        } catch (e) {
          // Se upsert por chave composta falhar (esquema diferente), seguir com fallback: create ignorando duplicatas
          console.warn("pixWebhook: upsert em bilhetes falhou, tentando fallback create:", e.message);
          try {
            for (const b of bilhetes) {
              // verificar se já existe bilhete com mesmas dezenas e paymentId
              const exists = await prisma.bilhete.findFirst({
                where: { dezenas: b, paymentId: String(paymentId) },
              });
              if (!exists) {
                await prisma.bilhete.create({
                  data: {
                    dezenas: b,
                    pago: true,
                    userId: payload?.metadata?.userId ?? txRecord?.userId ?? null,
                    paymentId: String(paymentId),
                  },
                });
              } else {
                // se existir, garantir que esteja marcado pago
                if (!exists.pago) {
                  await prisma.bilhete.update({
                    where: { id: exists.id },
                    data: { pago: true, paymentId: String(paymentId) },
                  });
                }
              }
            }
          } catch (innerErr) {
            console.error("pixWebhook: fallback create falhou:", innerErr);
          }
        }
      } else {
        console.log("pixWebhook: pagamento aprovado mas não encontrei bilhetes no metadata.", { paymentId });
      }
    } else {
      console.log("pixWebhook: evento recebido mas status não indica pagamento aprovado.", {
        paymentId,
        status: mpStatus,
      });
    }

    // Sempre ack com 200 para evitar retries incessantes
    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook error:", err);
    // ack anyway — MP precisa receber 200 para considerar entregue
    return res.status(200).send("ok");
  }
});

export default router;