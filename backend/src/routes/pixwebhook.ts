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
  const hour = now.getHours();

  const target = new Date(now);

  if (day === 3) {
    if (hour < 17) {
      target.setHours(20, 0, 0, 0);
      return target;
    }
    target.setDate(target.getDate() + 7);
    target.setHours(20, 0, 0, 0);
    return target;
  }

  const diff = (3 - day + 7) % 7;
  target.setDate(target.getDate() + diff);
  target.setHours(20, 0, 0, 0);

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
    // 🔹 CARTEIRA (PRIORIDADE)
    // =========================
    let carteira = await prisma.transacao_carteira.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!carteira) {
      const carteiraId = parseExternalReferenceId(
        externalReference,
        "wallet_"
      );

      if (carteiraId) {
        carteira = await prisma.transacao_carteira.findUnique({
          where: { id: carteiraId },
        });

        if (carteira) {
          await prisma.transacao_carteira.update({
            where: { id: carteiraId },
            data: { mpPaymentId: String(paymentId) },
          });
        }
      }
    }

    if (carteira) {
      // 🔒 ALTERAÇÃO: controle de idempotência para crédito em carteira
      let carteiraFoiPagaAgora = false;

      await prisma.$transaction(async (db) => {
        // 🔒 ALTERAÇÃO: updateMany + NOT status paid para evitar reprocessamento
        const carteiraStatusUpdated =
          await db.transacao_carteira.updateMany({
            where: {
              id: carteira.id,
              NOT: { status: "paid" },
            },
            data: { status: "paid" },
          });

        carteiraFoiPagaAgora =
          carteiraStatusUpdated.count > 0;

        // 🔒 ALTERAÇÃO: só credita saldo se acabou de marcar como paid
        if (carteiraFoiPagaAgora) {
          await db.$executeRaw`
            INSERT INTO wallet (user_id, saldo, created_at)
            VALUES (${carteira.userId}, 0, NOW())
            ON CONFLICT (user_id) DO NOTHING
          `;

          await db.wallet.updateMany({
            where: { userId: carteira.userId },
            data: {
              saldo: {
                increment: Number(carteira.valor),
              },
            },
          });
        }
      });

      // 🔒 ALTERAÇÃO: notify fora da transação para não afetar confirmação de pagamento
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
    // 🔹 BILHETE
    // =========================
    let transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

    if (!transacao) {
      const txId = parseExternalReferenceId(
        externalReference,
        "bilhete_tx_"
      );

      if (txId) {
        transacao = await prisma.transacao.findUnique({
          where: { id: txId },
        });

        if (transacao) {
          await prisma.transacao.update({
            where: { id: txId },
            data: { mpPaymentId: String(paymentId) },
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
      // 🔒 ALTERAÇÃO: notify fora da transação para não causar rollback
      const bilhetesParaNotificar: string[] = [];

      await prisma.$transaction(async (db) => {
        // 🔒 ALTERAÇÃO: updateMany + NOT status paid para idempotência
        const transacaoStatusUpdated =
          await db.transacao.updateMany({
            where: {
              id: transacao.id,
              NOT: { status: "paid" },
            },
            data: { status: "paid" },
          });

        // 🔒 ALTERAÇÃO: só cria bilhetes se acabou de pagar nesta execução
        if (transacaoStatusUpdated.count === 0) {
          return;
        }

        // 🔒 ALTERAÇÃO: evita duplicação de bilhetes por transação
        const bilheteExistente =
          await db.bilhete.findFirst({
            where: { transacaoId: transacao.id },
          });

        if (bilheteExistente) {
          return;
        }

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

          bilhetesParaNotificar.push(dezenas);
        }
      });

      // 🔒 ALTERAÇÃO: notify fora da transação
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
  res.json({ ping: true });
});

export default router;