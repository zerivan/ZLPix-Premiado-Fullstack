import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { notify } from "../services/notify";

const router = express.Router();

const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

async function fetchMpPayment(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST;
  const base  = process.env.MP_BASE_URL || "https://api.mercadopago.com";
  if (!token) return null;
  try {
    const resp = await fetchFn(
      `${base}/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id;

    if (!paymentId) {
      console.log("⚠️ Webhook recebido sem paymentId");
      return res.status(200).send("ok");
    }

    console.log(`📥 Webhook recebido: paymentId: ${paymentId}`);

    // Busca info no MP (quando possível)
    const mpInfo: any = await fetchMpPayment(String(paymentId));

    // Aceita status vindo do MP OU do payload
    const mpStatus =
      mpInfo?.status ||
      payload?.data?.status ||
      payload?.status;

    console.log(`📋 Status do pagamento: ${mpStatus}`);

    if (mpStatus !== "approved" && mpStatus !== "paid") {
      console.log(`⏸️ Pagamento não aprovado (status: ${mpStatus}), ignorando webhook`);
      return res.status(200).send("ok");
    }

    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacao || transacao.status === "paid") {
      console.log(`⚠️ Transação não encontrada ou já paga: paymentId: ${paymentId}`);
      return res.status(200).send("ok");
    }

    console.log(`✅ Transação encontrada: id: ${transacao.id}, userId: ${transacao.userId}`);

    const metadata =
      typeof transacao.metadata === "object" && transacao.metadata !== null
        ? (transacao.metadata as Prisma.JsonObject)
        : {};

    // DEPÓSITO DE CARTEIRA
    if (metadata["tipo"] === "deposito") {
      console.log(`💳 Processando depósito de carteira: paymentId: ${paymentId}, userId: ${transacao.userId}, valor: R$ ${Number(transacao.valor).toFixed(2)}`);
      
      await prisma.$transaction([
        prisma.wallet.updateMany({
          where: { userId: transacao.userId },
          data: { saldo: { increment: Number(transacao.valor) } },
        }),
        prisma.transacao.update({
          where: { id: transacao.id },
          data: { status: "paid" },
        }),
      ]);
      
      console.log(`✅ Depósito processado. Disparando notificação...`);
      
      await notify({
        type: "CARTEIRA_CREDITO",
        userId: String(transacao.userId),
        valor: Number(transacao.valor),
      });
      
      console.log(`✅ Webhook concluído para depósito: paymentId: ${paymentId}`);
      return res.status(200).send("ok");
    }

    // BILHETES
    if (metadata["tipo"] === "bilhete") {
      console.log(`🎟️ Processando pagamento de bilhete(s): paymentId: ${paymentId}, userId: ${transacao.userId}`);
      
      const bilhetesRaw = Array.isArray(metadata["bilhetes"])
        ? metadata["bilhetes"]
        : [];

      const sorteioData = getNextWednesday();

      await prisma.$transaction(async (db) => {
        await db.transacao.update({
          where: { id: transacao.id },
          data: { status: "paid" },
        });

        for (const item of bilhetesRaw) {
          let dezenas = "";
          const valor =
            Number(transacao.valor) /
            Math.max(bilhetesRaw.length, 1);

          if (typeof item === "string") dezenas = item;
          else if (typeof item === "object" && item !== null)
            dezenas = String((item as any).dezenas ?? "");

          if (!dezenas) continue;

          await db.bilhete.create({
            data: {
              userId: transacao.userId,
              transacaoId: transacao.id,
              dezenas,
              valor,
              pago: true,
              sorteioData,
              status: "ATIVO",
            },
          });

          console.log(`📢 Disparando notificação de bilhete criado: ${dezenas}`);

          await notify({
            type: "BILHETE_CRIADO",
            userId: String(transacao.userId),
            codigo: dezenas,
          });
        }
      });

      console.log(`✅ Webhook concluído para bilhete(s): ${bilhetesRaw.length} bilhete(s) criado(s)`);
      return res.status(200).send("ok");
    }

    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "paid" },
    });

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook erro:", err);
    return res.status(200).send("ok");
  }
});

// Opcional: Healthcheck
router.get("/__ping_pixwebhook", (req, res) => {
  res.json({ ping: true, rota: "pixwebhook" });
});

export default router;