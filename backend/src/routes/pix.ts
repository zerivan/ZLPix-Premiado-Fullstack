// backend/src/routes/pix.ts
import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

// ===============================
// Função: próxima quarta-feira às 20h
// ===============================
function proximaQuarta(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

// ===============================
// CRIAR PIX
// ===============================
router.post("/create", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (!amount || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Payload inválido." });
    }

    const uid = Number(userId);
    if (!uid || Number.isNaN(uid)) {
      return res.status(400).json({ error: "userId inválido." });
    }

    const user = await prisma.users.findUnique({
      where: { id: uid },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido." });
    }

    const tx = await prisma.transacao.create({
      data: {
        userId: uid,
        valor: Number(amount),
        status: "pending",
        metadata: { bilhetes },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    if (!mpToken) {
      return res.status(500).json({ error: "MP token ausente" });
    }

    const resp = await fetchFn("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        transaction_amount: Number(amount),
        description: description || "Bilhetes ZLPix",
        payment_method_id: "pix",
        payer: {
          email: user.email,
          first_name: user.name || "Cliente",
        },
      }),
    });

    const mpJson: any = await resp.json();

    if (!resp.ok) {
      return res.status(502).json(mpJson);
    }

    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          bilhetes,
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      payment_id: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("pix/create erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// =====================================================
// STATUS DO PAGAMENTO — CRIA BILHETES CORRETAMENTE
// =====================================================
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) return res.json({ status: "invalid" });

    const tx = await prisma.transacao.findFirst({
      where: { mpPaymentId: paymentId },
    });

    if (!tx) return res.json({ status: "invalid" });

    if (tx.status === "paid") {
      return res.json({ status: "paid" });
    }

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    if (!mpToken) {
      return res.json({ status: "pending" });
    }

    const resp = await fetchFn(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mpToken}` } }
    );

    const mpJson: any = await resp.json();

    if (mpJson?.status === "approved") {
      const bilhetes = (tx.metadata as any)?.bilhetes ?? [];

      await prisma.$transaction(async (db) => {
        await db.transacao.update({
          where: { id: tx.id },
          data: { status: "paid" },
        });

        for (const b of bilhetes) {
          await db.bilhete.create({
            data: {
              userId: tx.userId,
              transacaoId: tx.id,
              dezenas: typeof b === "string" ? b : String(b.dezenas),
              valor: Number(b.valor) || tx.valor / bilhetes.length,
              pago: true,
              status: "ATIVO",
              sorteioData: proximaQuarta(),
            },
          });
        }
      });

      return res.json({ status: "paid" });
    }

    return res.json({ status: "pending" });
  } catch (err) {
    console.error("payment-status erro:", err);
    return res.json({ status: "error" });
  }
});

export default router;