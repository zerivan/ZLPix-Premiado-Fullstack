import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — RELATÓRIOS (BANCO DE DADOS)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const [
      totalUsuarios,
      totalBilhetes,
      totalTransacoes,
      transacoesAprovadas,
      ultimaTransacao,
    ] = await Promise.all([
      prisma.users.count(),
      prisma.bilhete.count(),
      prisma.transacao.count(),
      prisma.transacao.findMany({
        where: { status: "approved" },
        select: { valor: true },
      }),
      prisma.transacao.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          valor: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const totalArrecadado = transacoesAprovadas.reduce(
      (acc, t) => acc + t.valor,
      0
    );

    return res.json({
      ok: true,
      data: {
        totalUsuarios,
        totalBilhetes,
        totalTransacoes,
        totalArrecadado,
        totalPago: totalArrecadado,
        ultimaTransacao,
      },
    });
  } catch (error) {
    console.error("Erro admin relatórios:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao gerar relatórios",
    });
  }
});

export default router;