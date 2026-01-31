import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — LISTAGEM COMPLETA DE BILHETES APURADOS
 * =====================================================
 * - Espelha exatamente a tabela bilhete
 * - Não formata
 * - Não recalcula
 * - Não altera estrutura
 * - Apenas retorna dados reais do banco
 */
router.get("/", async (_req, res) => {
  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        apuradoEm: { not: null }, // somente já apurados
      },
      orderBy: {
        apuradoEm: "desc",
      },
    });

    return res.json({
      ok: true,
      total: bilhetes.length,
      data: bilhetes,
    });
  } catch (error) {
    console.error("Erro admin listagem bilhetes:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar bilhetes",
    });
  }
});

export default router;