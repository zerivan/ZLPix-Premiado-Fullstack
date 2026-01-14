import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ADMIN marca saque como PAGO
 */
router.post("/pagar", async (req, res) => {
  try {
    const { transacaoId } = req.body;

    if (!transacaoId) {
      return res.status(400).json({ error: "transacaoId obrigatório" });
    }

    // 🔒 Garante que é saque direto no Prisma
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

    await prisma.transacao.update({
      where: { id: saque.id },
      data: { status: "paid" },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro admin-saques/pagar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;