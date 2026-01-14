import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ======================================
 * ADMIN — MARCAR SAQUE COMO PAGO
 * ======================================
 * Fluxo:
 * - Usuário solicita saque (wallet/saque) → status: pending
 * - Admin faz o PIX manualmente
 * - Admin chama esta rota
 * - Transação passa para status: paid
 */
router.post("/pagar", async (req, res) => {
  try {
    const { transacaoId } = req.body;

    if (!transacaoId) {
      return res.status(400).json({
        error: "transacaoId obrigatório",
      });
    }

    // 🔎 Busca somente SAQUE pendente
    const saque = await prisma.transacao.findFirst({
      where: {
        id: Number(transacaoId),
        status: "pending",
        metadata: {
          path: ["tipo"],
          equals: "saque",
        },
      },
    });

    if (!saque) {
      return res.status(404).json({
        error: "Saque não encontrado ou já processado",
      });
    }

    // ✅ Marca como pago
    await prisma.transacao.update({
      where: { id: saque.id },
      data: {
        status: "paid",
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro admin-saques/pagar:", err);
    return res.status(500).json({
      error: "Erro interno",
    });
  }
});

export default router;