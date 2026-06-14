import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { notify } from "../services/notify";

const router = express.Router();

const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

function getNextWednesday(): Date {
  const now = new Date();

  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  const dias: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = dias[valor("weekday")];
  const hour = Number(valor("hour"));

  const target = new Date(
    `${valor("year")}-${valor("month")}-${valor("day")}T20:00:00-03:00`
  );

  if (day === 3) {
    if (hour < 17) {
      return target;
    }

    target.setUTCDate(target.getUTCDate() + 7);
    return target;
  }

  const diff = (3 - day + 7) % 7;
  target.setUTCDate(target.getUTCDate() + diff);

  return target;
}

async function fetchMpPayment(paymentId: string) {
  const token =
    process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST;

  const base =
    process.env.MP_BASE_URL || "https://api.mercadopago.com";

  if (!token) return null;

  try {
    const resp = await fetchFn(
      `${base}/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!resp.ok) return null;

    return await resp.json();
  } catch {
    return null;
  }
}

function parseExternalReferenceId(
  externalReference: string,
  prefix: "wallet_" | "bilhete_tx_"
): number | null {
  if (!externalReference.startsWith(prefix)) return null;

  const rawId = externalReference.replace(prefix, "");

  if (!/^\d+$/.test(rawId)) return null;

  return Number(rawId);
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
      return res.status(200).send("ok");
    }

    const mpInfo: any = await fetchMpPayment(String(paymentId));

    const mpStatus =
      mpInfo?.status ||
      payload?.data?.status ||
      payload?.status;

    if (mpStatus !== "approved" && mpStatus !== "paid") {
      return res.status(200).send("ok");
    }

    const externalReference = String(
      mpInfo?.external_reference || ""
    );

    // =========================
    // CARTEIRA — PRIORIDADE
    // =========================
    let carteira = await prisma.transacao_carteira.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
    });

    if (!carteira) {
      const carteiraId = parseExternalReferenceId(
        externalReference,
        "wallet_"
      );

      if (carteiraId) {
        carteira = await prisma.transacao_carteira.findUnique({
          where: {
            id: carteiraId,
          },
        });

        if (carteira) {
          await prisma.transacao_carteira.update({
            where: {
              id: carteiraId,
            },
            data: {
              mpPaymentId: String(paymentId),
            },
          });
        }
      }
    }

    if (carteira) {
      let carteiraFoiPagaAgora = false;

      await prisma.$transaction(async (db) => {
        const carteiraStatusUpdated =
          await db.transacao_carteira.updateMany({
            where: {
              id: carteira.id,
              NOT: {
                status: "paid",
              },
            },
            data: {
              status: "paid",
            },
          });

        carteiraFoiPagaAgora =
          carteiraStatusUpdated.count > 0;

        if (carteiraFoiPagaAgora) {
          await db.$executeRaw`
            INSERT INTO wallet (user_id, saldo, created_at)
            VALUES (${carteira.userId}, 0, NOW())
            ON CONFLICT (user_id) DO NOTHING
          `;

          await db.wallet.updateMany({
            where: {
              userId: carteira.userId,
            },
            data: {
              saldo: {
                increment: Number(carteira.valor),
              },
            },
          });
        }
      });

      if (carteiraFoiPagaAgora) {
        await notify({
          type: "CARTEIRA_CREDITO",
          userId: String(carteira.userId),
          valor: Number(carteira.valor),
        });
      }

      return res.status(200).send("ok");
    }

    // =========================
    // BILHETE
    // =========================
    let transacao = await prisma.transacao.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
    });

    if (!transacao) {
      const txId = parseExternalReferenceId(
        externalReference,
        "bilhete_tx_"
      );

      if (txId) {
        transacao = await prisma.transacao.findUnique({
          where: {
            id: txId,
          },
        });

        if (transacao) {
          await prisma.transacao.update({
            where: {
              id: txId,
            },
            data: {
              mpPaymentId: String(paymentId),
            },
          });
        }
      }
    }

    if (!transacao) {
      return res.status(200).send("ok");
    }

    if (transacao.tipo === "BILHETE") {
      const metadata =
        typeof transacao.metadata === "object" &&
        transacao.metadata !== null
          ? (transacao.metadata as Prisma.JsonObject)
          : {};

      const bilhetesRaw = Array.isArray(metadata["bilhetes"])
        ? metadata["bilhetes"]
        : [];

      const sorteioData = getNextWednesday();
      const bilhetesParaNotificar: string[] = [];

      await prisma.$transaction(async (db) => {
        const transacaoStatusUpdated =
          await db.transacao.updateMany({
            where: {
              id: transacao.id,
              NOT: {
                status: "paid",
              },
            },
            data: {
              status: "paid",
            },
          });

        if (transacaoStatusUpdated.count === 0) {
          return;
        }

        const bilheteExistente =
          await db.bilhete.findFirst({
            where: {
              transacaoId: transacao.id,
            },
          });

        if (bilheteExistente) {
          return;
        }

        for (const item of bilhetesRaw) {
          let dezenas = "";

          const valor =
            Number(transacao.valor) /
            Math.max(bilhetesRaw.length, 1);

          if (typeof item === "string") {
            dezenas = item;
          } else if (typeof item === "object" && item !== null) {
            dezenas = String((item as any).dezenas ?? "");
          }

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

          bilhetesParaNotificar.push(dezenas);
        }
      });

      for (const dezenas of bilhetesParaNotificar) {
        await notify({
          type: "BILHETE_CRIADO",
          userId: String(transacao.userId),
          codigo: dezenas,
        });
      }

      return res.status(200).send("ok");
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook erro:", err);
    return res.status(200).send("ok");
  }
});

router.get("/__ping_pixwebhook", (req, res) => {
  res.json({
    ping: true,
  });
});

export default router;