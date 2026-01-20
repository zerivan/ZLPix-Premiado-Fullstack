import express from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = express.Router();

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
 * POST /wallet/saque
 * (já existente — mantido)
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
 * Usado pelo polling da página PIX (fluxo CARTEIRA)
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
      // comportamento compatível com frontend (polling continua)
      return res.json({ status: "pending" });
    }

    const tipo =
      transacao.metadata && typeof transacao.metadata === "object"
        ? (transacao.metadata as any).tipo
        : undefined;

    // Garante que esse endpoint responde apenas para depósitos de carteira
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

export default router;
