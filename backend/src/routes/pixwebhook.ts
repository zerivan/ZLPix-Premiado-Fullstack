import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { notify } from "../services/notify";

const router = express.Router();

const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * Próxima quarta-feira (data do sorteio)
 */
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

    if (!paymentId) return res.status(200).send("ok");

    const mpInfo: any = await fetchMpPayment(String(paymentId));
    const mpStatus = mpInfo?.status || payload?.data?.status;

    if (mpStatus !== "approved") {
      return res.status(200).send("ok");
    }

    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacao || transacao.status === "paid") {
      return res.status(200).send("ok");
    }

    const metadata =
      typeof transacao.metadata === "object" && transacao.metadata !== null
        ? (transacao.metadata as Prisma.JsonObject)
        : {};

    /**
     * 💰 DEPÓSITO DE CARTEIRA
     */
    if (metadata["tipo"] === "deposito" && metadata["origem"] === "wallet") {
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

      await notify({
        type: "CARTEIRA_CREDITO",
        userId: String(transacao.userId),
        valor: Number(transacao.valor),
      });

      return res.status(200).send("ok");
    }

    /**
     * 🎟️ BILHETES
     */
    if (metadata["tipo"] === "bilhete" && metadata["origem"] === "aposta") {
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
          let valor =
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
        }
      });

      await notify({
        type: "PIX_PAGO",
        userId: String(transacao.userId),
        valor: Number(transacao.valor),
      });

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

export default router;