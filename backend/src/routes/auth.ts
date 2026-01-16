import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = express.Router();

// fetch nativo
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

// ===============================
// 🧠 Próximo sorteio (quarta-feira)
// ===============================
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 dom - 3 qua
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0); // 20h padrão
  return next;
}

// =====================================================
// 🧾 PIX — CRIAR PAGAMENTO DE BILHETES
// =====================================================
router.post("/create-bilhete", async (req, res) => {
  try {
    const { userId, amount, description, bilhetes } = req.body;

    if (!userId || !amount || !Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Payload inválido." });
    }

    const uid = Number(userId);
    const total = Number(amount);

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
        valor: total,
        status: "pending",
        metadata: {
          tipo: "bilhete",
          bilhetes,
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST;

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
        transaction_amount: total,
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
          tipo: "bilhete",
          bilhetes,
          mpResponse: mpJson,
        },
      },
    });

    return res.json({
      paymentId: String(mpJson.id),
      qr_code_base64:
        mpJson.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      copy_paste:
        mpJson.point_of_interaction?.transaction_data?.qr_code ?? null,
    });
  } catch (err) {
    console.error("pix/create-bilhete erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// =====================================================
// 📌 STATUS DO PAGAMENTO
// =====================================================
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const tx = await prisma.transacao.findFirst({
      where: { mpPaymentId: paymentId },
    });

    if (!tx) return res.json({ status: "PENDING" });
    if (tx.status === "paid") return res.json({ status: "PAID" });

    const mpToken =
      process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST;

    if (!mpToken) return res.json({ status: "PENDING" });

    const resp = await fetchFn(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${mpToken}` } }
    );

    const mpJson: any = await resp.json();

    if (mpJson?.status === "approved") {
      return res.json({ status: "PAID" });
    }

    return res.json({ status: "PENDING" });
  } catch (err) {
    console.error("payment-status erro:", err);
    return res.status(500).json({ status: "ERROR" });
  }
});

// =====================================================
// ✅ CONFIRMAR PAGAMENTO E GERAR BILHETES
// =====================================================
router.post("/confirmar-bilhete", async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId obrigatório" });
    }

    const tx = await prisma.transacao.findFirst({
      where: {
        mpPaymentId: String(paymentId),
        status: "pending",
      },
    });

    if (!tx) return res.json({ ok: true });

    const bilhetes = (tx.metadata as any)?.bilhetes;
    if (!Array.isArray(bilhetes) || bilhetes.length === 0) {
      return res.status(400).json({ error: "Bilhetes ausentes" });
    }

    const sorteioData = getNextWednesday();

    await prisma.$transaction([
      prisma.transacao.update({
        where: { id: tx.id },
        data: { status: "paid" },
      }),
      ...bilhetes.map((b: any) =>
        prisma.bilhete.create({
          data: {
            userId: tx.userId,
            transacaoId: tx.id,
            dezenas: b.dezenas,
            valor: b.valor,
            pago: true,
            sorteioData, // ✅ CAMPO OBRIGATÓRIO
          },
        })
      ),
    ]);

    return res.json({ ok: true });
  } catch (err) {
    console.error("pix/confirmar-bilhete erro:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;