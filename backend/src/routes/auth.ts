// backend/src/routes/pixwebhook.ts
import express, { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { notify } from "../services/notify";

const router = express.Router();

const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

/**
 * 🔥 REGRA CORRETA DO SORTEIO
 * - Quarta antes das 17h → hoje às 20h
 * - Quarta após 17h → próxima quarta às 20h
 * - Outros dias → próxima quarta às 20h
 */
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 3=qua
  const hour = now.getHours();

  const target = new Date(now);

  if (day === 3) {
    // Hoje é quarta-feira
    if (hour < 17) {
      // Antes das 17h → concorre hoje
      target.setHours(20, 0, 0, 0);
      return target;
    }

    // Após 17h → próxima quarta
    target.setDate(target.getDate() + 7);
    target.setHours(20, 0, 0, 0);
    return target;
  }

  // Não é quarta → calcula próxima quarta
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

router.post("/", express.json(), async (req: Request, res: Response) => {
  try {
    const payload: any = req.body || {};

    const paymentId =
      payload?.data?.id ||
      payload?.resource?.id ||
      payload?.id ||
      payload?.payment_id;

    const xSignatureRaw = req.header("x-signature");
    const xRequestIdRaw = req.header("x-request-id");

    const xSignature = Array.isArray(xSignatureRaw)
      ? xSignatureRaw[0]
      : xSignatureRaw || "";

    const xRequestId = Array.isArray(xRequestIdRaw)
      ? xRequestIdRaw[0]
      : xRequestIdRaw || "";

    const signatureParts: Record<string, string> = xSignature
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .reduce((acc, part) => {
        const [key, ...valueParts] = part.split("=");
        if (key) {
          acc[key] = valueParts.join("=");
        }
        return acc;
      }, {} as Record<string, string>);

    const ts = signatureParts.ts || "";
    const v1 = signatureParts.v1 || "";
    const webhookSecret = process.env.MP_WEBHOOK_SECRET || "";
    const manifest = `id:${String(
      paymentId || ""
    )};request-id:${xRequestId};ts:${ts};`;
    const generatedSignature = webhookSecret
      ? crypto
          .createHmac("sha256", webhookSecret)
          .update(manifest)
          .digest("hex")
      : "";

    if (!v1 || generatedSignature !== v1) {
      return res.status(200).send("invalid signature");
    }

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

    // 🔹 PRIMEIRO: VERIFICAR SE É CARTEIRA
    const transacaoCarteira = await prisma.transacao_carteira.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
    });

    if (transacaoCarteira) {
      const processado = await prisma.$transaction(async (db) => {
        const claim = await db.transacao_carteira.updateMany({
          where: {
            id: transacaoCarteira.id,
            NOT: { status: "paid" },
          },
          data: { status: "paid" },
        });

        if (claim.count === 0) {
          return false;
        }

        await db.$executeRaw`
          INSERT INTO wallet (user_id, saldo, created_at)
          VALUES (${transacaoCarteira.userId}, 0, NOW())
          ON CONFLICT (user_id) DO NOTHING
        `;

        await db.wallet.updateMany({
          where: { userId: transacaoCarteira.userId },
          data: {
            saldo: {
              increment: Number(transacaoCarteira.valor),
            },
          },
        });

        return true;
      });

      if (!processado) {
        return res.status(200).send("ok");
      }

      await notify({
        type: "CARTEIRA_CREDITO",
        userId: String(transacaoCarteira.userId),
        valor: Number(transacaoCarteira.valor),
      });

      return res.status(200).send("ok");
    }

    // 🔹 SENÃO: É BILHETE
    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
    });

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

      const processado = await prisma.$transaction(async (db) => {
        const claim = await db.transacao.updateMany({
          where: {
            id: transacao.id,
            NOT: { status: "paid" },
          },
          data: { status: "paid" },
        });

        if (claim.count === 0) {
          return false;
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

          await notify({
            type: "BILHETE_CRIADO",
            userId: String(transacao.userId),
            codigo: dezenas,
          });
        }

        return true;
      });

      if (!processado) {
        return res.status(200).send("ok");
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