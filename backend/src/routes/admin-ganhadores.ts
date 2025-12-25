import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — GANHADORES (APENAS BILHETES PREMIADOS)
 * =====================================================
 * REGRA:
 * - Só exibe bilhetes com status = 'PREMIADO'
 * - Não calcula prêmio
 * - Não inventa ganhador
 * - Apenas ESPELHA o banco
 */
router.get("/", async (_req, res) => {
  try {
    const bilhetesPremiados = await prisma.bilhete.findMany({
      where: {
        status: "PREMIADO",
      },
      orderBy: {
        apuradoem: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
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

    const ganhadores = bilhetesPremiados.map((b) => ({
      userId: b.user.id,
      nome: b.user.name,
      dezenas: b.dezenas,
      premio: Number(b.premiovalor || 0),
      resultadoFederal: b.resultadofederal,
      apuradoEm: b.apuradoem,
      transacaoId: b.transacao?.id,
    }));

    return res.json({
      ok: true,
      total: ganhadores.length,
      data: ganhadores,
    });
  } catch (error) {
    console.error("Erro admin ganhadores:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar ganhadores",
    });
  }
});

export default router;