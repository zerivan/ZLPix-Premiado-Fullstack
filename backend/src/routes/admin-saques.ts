import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ======================================
 * ADMIN — LISTAR SAQUES
 * ======================================
 * Retorna TODOS os saques (pending / paid)
 */
router.get("/", async (_req, res) => {
  try {
    const saques = await prisma.transacao.findMany({
      where: {
        metadata: {
          path: ["tipo"],
          equals: "saque",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        userId: true,
        valor: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    });

    return res.json(saques);
  } catch (err) {
    console.error("Erro admin-saques/listar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ======================================
 * ADMIN — MARCAR SAQUE COMO PAGO
 * ======================================
 */
router.post("/pagar", async (req, res) => {
  try {
    const { transacaoId } = req.body;

    if (!transacaoId) {
      return res.status(400).json({
        error: "transacaoId obrigatório",
      });
    }

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
    return res.status(500).json({
      error: "Erro interno",
    });
  }
});

export default router;