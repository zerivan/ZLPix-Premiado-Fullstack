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

    // 🔐 garantir wallet (NÃO MUDA)
    const walletExistente = await prisma.wallet.findUnique({
      where: { userId: transacao.userId },
    });

    if (!walletExistente) {
      await prisma.wallet.create({
        data: { userId: transacao.userId },
      });
    }

    // ✅ metadata seguro (NÃO MUDA)
    const metadata =
      typeof transacao.metadata === "object" && transacao.metadata !== null
        ? (transacao.metadata as Prisma.JsonObject)
        : {};

    // =========================================
    // 💰 DEPÓSITO EM CARTEIRA (NOVO – CIRÚRGICO)
    // =========================================
    if (metadata.tipo === "deposito") {
      await prisma.wallet.update({
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

      console.log("💰 Depósito confirmado", {
        userId: transacao.userId,
        valor: transacao.valor,
      });

      return res.status(200).send("ok");
    }

    // =========================
    // FLUXO ORIGINAL DE BILHETE
    // =========================
    const bilhetesMeta = Array.isArray(metadata.bilhetes)
      ? (metadata.bilhetes as Array<{ dezenas: string; valor: number }>)
      : [];

    const sorteioData = getNextWednesday();

    for (const b of bilhetesMeta) {
      await prisma.bilhete.create({
        data: {
          dezenas: b.dezenas,
          valor: Number(b.valor),
          pago: true,
          sorteioData,
          user: {
            connect: { id: transacao.userId },
          },
          transacao: {
            connect: { id: transacao.id },
          },
        },
      });
    }

    await prisma.transacao.update({
      where: { id: transacao.id },
      data: { status: "paid" },
    });

    // 🔥 WhatsApp (NÃO MUDA)
    try {
      const user = await prisma.users.findUnique({
        where: { id: transacao.userId },
      });

      if (user?.phone && bilhetesMeta.length > 0) {
        let telefone = String(user.phone).replace(/\D/g, "");
        if (!telefone.startsWith("55")) telefone = "55" + telefone;

        await enviarWhatsApp("BILHETE_GERADO", {
          telefone,
          bilheteId: transacao.id,
          dezenas: bilhetesMeta.map(b => b.dezenas).join(" | "),
          valor: bilhetesMeta.reduce(
            (s, b) => s + Number(b.valor),
            0
          ),
          sorteioData,
        });
      }
    } catch (err) {
      console.error("Erro ao enviar WhatsApp (bilhete gerado):", err);
    }

    console.log("pixWebhook: pagamento confirmado", {
      paymentId,
      bilhetesCriados: bilhetesMeta.length,
    });

    return res.status(200).send("ok");
  } catch (err) {
    console.error("pixWebhook erro:", err);
    return res.status(200).send("ok");
  }
});

export default router;