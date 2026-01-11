// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const router = express.Router();

// fetch nativo
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

/**
 * ⏰ Decide status do bilhete conforme regra das 17h
 */
function definirStatusBilhete(): {
  status: "ATIVO_ATUAL" | "ATIVO_PROXIMO";
  sorteioData: Date;
} {
  const agora = new Date();
  const dia = agora.getDay(); // 3 = quarta
  const hora = agora.getHours();

  if (dia === 3 && hora >= 17) {
    return {
      status: "ATIVO_PROXIMO",
      sorteioData: getNextWednesday(),
    };
  }

  return {
    status: "ATIVO_ATUAL",
    sorteioData: getNextWednesday(),
  };
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

    const metadata =
      typeof transacao.metadata === "object" && transacao.metadata !== null
        ? (transacao.metadata as Prisma.JsonObject)
        : {};

    // =========================================
    // 💰 DEPÓSITO EM CARTEIRA (INALTERADO)
    // =========================================
    if (metadata["tipo"] === "deposito") {
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
    // 🎟️ CRIAÇÃO DE BILHETES (AJUSTE CIRÚRGICO)
    // =========================================
    const bilhetesRaw = Array.isArray(metadata["bilhetes"])
      ? metadata["bilhetes"]
      : [];

    const { status, sorteioData } = definirStatusBilhete();

    await prisma.$transaction(async (db) => {
      await db.transacao.update({
        where: { id: transacao.id },
        data: { status: "paid" },
      });

      for (const item of bilhetesRaw) {
        let dezenas = "";
        let valor = Number(transacao.valor) / Math.max(bilhetesRaw.length, 1);

        if (typeof item === "string") {
          dezenas = item;
        } else if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, any>;
          dezenas = String(obj.dezenas ?? "");
          if (obj.valor !== undefined) {
            valor = Number(obj.valor);
          }
        }

        if (!dezenas) continue;

        await db.bilhete.create({
          data: {
            userId: transacao.userId,
            transacaoId: transacao.id,
            dezenas,
            valor,
            pago: true,
            status,
            sorteioData,
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