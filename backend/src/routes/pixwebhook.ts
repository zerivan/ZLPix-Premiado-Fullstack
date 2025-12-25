// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { enviarWhatsApp } from "../services/whatsapp";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * Próxima quarta-feira (data do sorteio)
 */
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo
  const diff = (3 - day + 7) % 7 || 7; // 3 = quarta
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

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
      payload?.payment_id ||
      payload?.topicData?.id ||
      payload?.data?.object?.id ||
      payload?.data?.payment?.id ||
      null;

    if (!paymentId) return res.status(200).send("ok");

    const mpInfo: any = await fetchMpPayment(String(paymentId));
    const mpStatus = mpInfo?.status || payload?.data?.status;

    if (mpStatus !== "approved") {
      return res.status(200).send("ok");
    }

    // 🔧 Buscar transação
    const transacao = await prisma.transacao.findFirst({
      where: {
        OR: [
          { mpPaymentId: String(paymentId) },
          { mpPaymentId: String(payload?.resource) },
          { mpPaymentId: String(payload?.id) },
        ],
      },
    });

    if (!transacao || transacao.status === "paid") {
      return res.status(200).send("ok");
    }

    // 🔐 garantir wallet
    const walletExistente = await prisma.wallet.findFirst({
      where: { userId: transacao.userId },
    });

    if (!walletExistente) {
      await prisma.wallet.create({
        data: {
          user: {
            connect: { id: transacao.userId },
          },
          saldo: 0,
          createdAt: new Date(),
        },
      });
    }

    // ✅ metadata seguro
    const metadata =
      typeof transacao.metadata === "object" && transacao.metadata !== null
        ? (transacao.metadata as Prisma.JsonObject)
        : {};

    // =========================================
    // 💰 DEPÓSITO EM CARTEIRA (MANTIDO)
    // =========================================
    if (metadata.tipo === "deposito") {
      await prisma.wallet.updateMany({
        where: { userId: transacao.userId },
        data: {
          saldo: {
            increment: Number(transacao.valor),
          },
        },
      });

      await prisma.transacao.update({
        where: { id: transacao.id },
        data: { status: "paid" },
      });

      return res.status(200).send("ok");
    }

    // =========================================
    // 🎟️ CRIAÇÃO DE BILHETES (CORREÇÃO AQUI)
    // =========================================
    const bilhetes = Array.isArray(metadata.bilhetes)
      ? metadata.bilhetes
      : [];

    await prisma.$transaction(async (db) => {
      await db.transacao.update({
        where: { id: transacao.id },
        data: { status: "paid" },
      });

      for (const b of bilhetes) {
        await db.bilhete.create({
          data: {
            userId: transacao.userId,
            transacaoId: transacao.id,
            dezenas: typeof b === "string" ? b : String(b.dezenas),
            valor:
              typeof b === "object" && b.valor
                ? Number(b.valor)
                : Number(transacao.valor) / bilhetes.length,
            pago: true,
            status: "ATIVO",
            sorteioData: getNextWednesday(),
          },
        });
      }
    });

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook erro:", err);
    return res.status(200).send("ok");
  }
});

export default router;