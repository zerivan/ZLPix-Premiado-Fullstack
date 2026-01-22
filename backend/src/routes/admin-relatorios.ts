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
      totalBilhetesPagos,
      totalTransacoes,
      transacoesBilhetes,
      transacoesPremios,
      transacoesDepositos,
      transacoesSaques,
      ultimaTransacao,
    ] = await Promise.all([
      prisma.users.count(),

      // 🎟️ apenas bilhetes pagos
      prisma.bilhete.count({
        where: { pago: true },
      }),

      prisma.transacao.count(),

      // 💰 arrecadação real (compra de bilhetes) - APENAS de transacao (bilhetes)
      prisma.transacao.findMany({
        where: {
          status: "paid",
          tipo: "BILHETE",
        },
        select: { valor: true },
      }),

      // 🏆 prêmios pagos - EXCLUSIVAMENTE de transacao_carteira
      prisma.transacao_carteira.findMany({
        where: {
          status: "paid",
          tipo: "PREMIO",
        },
        select: { valor: true },
      }),

      // 💼 depósitos em carteira - EXCLUSIVAMENTE de transacao_carteira
      prisma.transacao_carteira.findMany({
        where: {
          status: "paid",
          tipo: "DEPOSITO",
        },
        select: { valor: true },
      }),

      // 📤 saques solicitados - EXCLUSIVAMENTE de transacao_carteira
      prisma.transacao_carteira.findMany({
        where: {
          tipo: "SAQUE",
        },
        select: { valor: true, status: true },
      }),

      prisma.transacao.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          valor: true,
          status: true,
          createdAt: true,
          metadata: true,
        },
      }),
    ]);

    const soma = (arr: { valor: any }[]) =>
      arr.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

    return res.json({
      ok: true,
      data: {
        totalUsuarios,
        totalBilhetesPagos,
        totalTransacoes,

        arrecadadoBilhetes: soma(transacoesBilhetes),
        totalPremiosPagos: soma(transacoesPremios),
        totalDepositosCarteira: soma(transacoesDepositos),

        totalSaquesSolicitados: soma(
          transacoesSaques.filter((s) => s.status === "pending")
        ),

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