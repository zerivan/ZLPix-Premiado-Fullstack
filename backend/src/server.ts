import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =========================
 * POST /api/admin/saques/pagar
 * =========================
 * ADMIN marca saque como PAGO
 */
router.post("/pagar", async (req, res) => {
  try {
    const { transacaoId } = req.body;

    if (!transacaoId) {
      return res.status(400).json({
        ok: false,
        error: "transacaoId obrigatório",
      });
    }

    const saque = await prisma.transacao.findUnique({
      where: { id: Number(transacaoId) },
    });

    if (!saque) {
      return res.status(404).json({
        ok: false,
        error: "Transação não encontrada",
      });
    }

    // 🔒 Narrowing seguro do metadata (JsonValue)
    const metadata =
      typeof saque.metadata === "object" && saque.metadata !== null
        ? (saque.metadata as any)
        : null;

    if (!metadata || metadata.tipo !== "saque") {
      return res.status(400).json({
        ok: false,
        error: "Transação não é um saque",
      });
    }

    if (saque.status === "paid") {
      return res.status(400).json({
        ok: false,
        error: "Saque já está pago",
      });
    }

    await prisma.transacao.update({
      where: { id: Number(transacaoId) },
      data: {
        status: "paid",
      },
    });

    return res.json({
      ok: true,
      message: "Saque marcado como PAGO",
    });
  } catch (err) {
    console.error("❌ Erro admin-saques/pagar:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno",
    });
  }
});

export default router;