import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — GANHADORES
 * =====================================================
 * REGRA:
 * - Só mostra bilhetes com status = 'PREMIADO'
 * - Apenas ESPELHA o banco
 * - Não calcula, não inventa
 */
router.get("/", async (_req, res) => {
  try {
    const bilhetesPremiados = await prisma.bilhete.findMany({
      where: {
        status: "PREMIADO",
      },
      orderBy: {
        apuradoEm: "desc",
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
      premio: Number(b.premioValor || 0),
      resultadoFederal: b.resultadoFederal,
      apuradoEm: b.apuradoEm,
      transacaoId: b.transacao?.id ?? null,
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