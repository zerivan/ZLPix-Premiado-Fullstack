import express, { Request, Response } from "express";
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
              increment: Number(transacaoCarteira