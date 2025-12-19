import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * GANHADORES — PAINEL ADMIN
 * =====================================================
 * Lista transações de PRÊMIO
 * Baseado exclusivamente em metadata.tipo = "premio"
 */
router.get("/", async (_req, res) => {
  try {
    const ganhadores = await prisma.transacao.findMany({
      where: {
        metadata: {
          path: ["tipo"],
          equals: "premio",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bilhetes: {
          select: {
            id: true,
            dezenas: true,
            valor: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      ok: true,
      total: ganhadores.length,
      data: ganhadores,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar ganhadores:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao buscar ganhadores",
    });
  }
});

export default router;