import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = express.Router();

// fetch nativo (compat)
const fetchFn: typeof fetch = (...args: any) =>
  (globalThis as any).fetch(...args);

function getUserId(req: any): number | null {
  const userId =
    req.headers["x-user-id"] ||
    req.query.userId ||
    req.body?.userId;

  if (!userId) return null;
  const n = Number(userId);
  return Number.isNaN(n) ? null : n;
}

/**
 * =========================
 * POST /wallet/depositar
 * Fluxo: cria transacao (pending) → chama MercadoPago → retorna paymentId/QR
 * Retorna paymentId (camelCase) para o frontend — corresponde ao polling em /wallet/payment-status/:paymentId
 * =========================
 */
router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { email: true, name: true },
    });

    if (!user?.email) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    // 1️⃣ cria transação PENDENTE (DEPÓSITO — carteira)
    const tx = await prisma.transacao.create({
      data: {
        userId: Number(userId),
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "deposito",
          origem: "wallet",
        },
      },
    });

    const mpToken =
      process.env.MP_ACCESS_TOKEN ||
      process.env.MP_ACCESS_TOKEN_TEST;

    const mpBase =
      process.env.MP_BASE_URL || "https://api.mercadopago.com";

    if (!mpToken) {
      return res.status(500).json({ error: "Token Mercado Pago ausente" });
    }

    const body = {
      transaction_amount: Number(valor),
      description: "Depósito na Carteira ZLPix",
      payment_method_id: "pix",
      payer: {
        email: user.email,
        first_name: user.name || "Cliente",
      },
    };

    const resp = await fetchFn(`${mpBase}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mpToken}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });

    const mpJson: any = await resp.json().catch(() => null);

    if (!resp.ok || !mpJson) {
      console.error("Erro MercadoPago /payments:", mpJson || "sem json");
      return res.status(502).json({ error: "Erro ao gerar PIX" });
    }

    // 2️⃣ atualiza transação com retorno do MP
    await prisma.transacao.update({
      where: { id: tx.id },
      data: {
        mpPaymentId: String(mpJson.id),
        metadata: {
          tipo: "deposito",
          origem: "wallet",
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
    console.error("Erro wallet/depositar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * POST /wallet/saque
 * (mantido)
 * =========================
 */
router.post("/saque", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor, pixKey } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet || Number(wallet.saldo) < Number(valor)) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    const saquePendente = await prisma.transacao.findFirst({
      where: {
        userId,
        status: "pending",
        metadata: {
          path: ["tipo"],
          equals: "saque",
        },
      },
    });

    if (saquePendente) {
      return res.status(400).json({
        error: "Você já possui um saque em análise",
      });
    }

    await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "saque",
          origem: "wallet",
          pixKey: pixKey || null,
        },
      },
    });

    // 🔔 DISPARO DE NOTIFICAÇÃO
    await notify({
      type: "SAQUE_SOLICITADO",
      userId: String(userId),
      valor: Number(valor),
    });

    return res.json({
      ok: true,
      message: "Saque solicitado e enviado para análise",
    });
  } catch (err) {
    console.error("Erro saque:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * GET /wallet/payment-status/:paymentId
 * Polling do frontend (fluxo CARTEIRA)
 * Valida metadata.tipo === "deposito"
 * =========================
 */
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId ausente" });
    }

    const transacao = await prisma.transacao.findFirst({
      where: {
        mpPaymentId: String(paymentId),
      },
      select: {
        status: true,
        metadata: true,
      },
    });

    if (!transacao) {
      return res.json({ status: "pending" });
    }

    const tipo =
      transacao.metadata && typeof transacao.metadata === "object"
        ? (transacao.metadata as any).tipo
        : undefined;

    if (tipo !== "deposito") {
      return res.status(404).json({
        error:
          "Pagamento encontrado, mas não pertence ao fluxo de carteira. Use o endpoint de bilhete se aplicável.",
      });
    }

    return res.json({ status: transacao.status });
  } catch (err) {
    console.error("Erro wallet/payment-status:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * GET /wallet/historico
 * Retorna histórico de transações do usuário
 * =========================
 */
router.get("/historico", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(400).json({ error: "Usuário inválido" });
    }

    const transacoes = await prisma.transacao.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    // Serializar para JSON-friendly
    const result = transacoes.map((t) => ({
      id: t.id,
      userId: t.userId,
      valor: Number(t.valor),
      status: t.status,
      mpPaymentId: t.mpPaymentId,
      metadata: t.metadata,
      createdAt: t.createdAt.toISOString(),
    }));

    return res.json(result);
  } catch (err) {
    console.error("Erro /wallet/historico:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
