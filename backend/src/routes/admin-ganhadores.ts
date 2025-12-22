import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — GANHADORES (BASEADO EM BILHETES PAGOS)
 * =====================================================
 * Lê DIRETO do banco:
 * bilhete + users + transacao
 */
router.get("/", async (_req, res) => {
  try {
    const bilhetesPagos = await prisma.bilhete.findMany({
      where: {
        pago: true,
      },
      orderBy: {
        createdAt: "desc",
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
            valor: true,
          },
        },
      },
    });

    const ganhadores = bilhetesPagos.map((b) => ({
      userId: b.user.id,
      nome: b.user.name,
      dezenas: b.dezenas,
      premio: b.valor, // provisório (valor do bilhete)
      transacaoId: b.transacao?.id,
      statusPagamento: b.transacao?.status,
    }));

    return res.json({
      ok: true,
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