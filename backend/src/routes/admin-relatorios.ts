import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — RELATÓRIOS (BANCO DE DADOS)
 * =====================================================
 * Apenas LEITURA / DIAGNÓSTICO
 */
router.get("/", async (_req, res) => {
  try {
    const [
      totalUsuarios,
      totalBilhetes,
      totalTransacoes,
      transacoesConfirmadas,
      ultimaTransacao,
    ] = await Promise.all([
      prisma.users.count(),

      prisma.bilhete.count(),

      prisma.transacao.count(),

      // 💰 dinheiro efetivo (não pending)
      prisma.transacao.findMany({
        where: {
          status: {
            not: "pending",
          },
        },
        select: {
          valor: true,
        },
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

    const totalArrecadado = transacoesConfirmadas.reduce((acc, t) => {
      return acc + (Number(t.valor) || 0);
    }, 0);

    return res.json({
      ok: true,
      data: {
        totalUsuarios,
        totalBilhetes,
        totalTransacoes,
        totalArrecadado,
        totalPago: totalArrecadado, // diagnóstico (por enquanto)
        ultimaTransacao: ultimaTransacao
          ? {
              ...ultimaTransacao,
              valor: Number(ultimaTransacao.valor) || 0,
            }
          : null,
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