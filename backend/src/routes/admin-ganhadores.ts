import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
=====================================================

ADMIN — RESULTADO DO SORTEIO

=====================================================

REGRA:

Mostra TODOS os bilhetes já apurados

PREMIADO e NAO_PREMIADO

Apenas ESPELHA o banco
*/
router.get("/", async (_req, res) => {
  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        apuradoEm: { not: null }, // 🔥 apenas já processados
      },
      orderBy: {
        apuradoEm: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            pixKey: true,
          },
        },
        transacao: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    return res.json({
      ok: true,
      total: bilhetes.length,
      data: bilhetes,
    });
  } catch (error) {
    console.error("Erro admin resultado:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar resultado",
    });
  }
});

export default router;