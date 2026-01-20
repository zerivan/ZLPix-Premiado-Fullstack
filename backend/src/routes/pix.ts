import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * =========================
 * GET /pix/payment-status/:paymentId
 * Retorna status da transacao vinculada a um pagamento de BILHETE
 * Valida metadata.tipo === "bilhete"
 * =========================
 */
router.get("/payment-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId ausente" });
    }

    const transacao = await prisma.transacao.findFirst({
      where: { mpPaymentId: String(paymentId) },
      select: { status: true, metadata: true },
    });

    if (!transacao) {
      // comportamento compatível com frontend (polling continua)
      return res.json({ status: "pending" });
    }

    // metadata pode ser Json | null
    const tipo =
      transacao.metadata && typeof transacao.metadata === "object"
        ? (transacao.metadata as any).tipo
        : undefined;

    // Assegura que esse endpoint responde apenas para pagamentos de bilhete
    if (tipo !== "bilhete") {
      return res.status(404).json({
        error:
          "Pagamento encontrado, mas não pertence ao fluxo de bilhete. Use o endpoint de carteira se aplicável.",
      });
    }

    return res.json({ status: transacao.status });
  } catch (err) {
    console.error("Erro pix/payment-status:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;
