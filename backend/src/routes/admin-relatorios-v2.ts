import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

type UserFinanceRow = {
  userId: number;
  nome: string;
  totalGasto: number;
  totalSacado: number;
  totalPremio: number;
};

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const mes = Number(req.query.mes) || now.getMonth() + 1;
    const ano = Number(req.query.ano) || now.getFullYear();

    if (mes < 1 || mes > 12 || ano < 2000 || ano > 9999) {
      return res.status(400).json({
        ok: false,
        error: "Parâmetros inválidos. Use mes=MM e ano=YYYY.",
      });
    }

    const inicio = new Date(ano, mes - 1, 1);
    const fim = new Date(ano, mes, 1);

    const [
      arrecadadoAgg,
      premiosPagosAgg,
      saquesPagosAgg,
      gastoPorUsuario,
      saquePorUsuario,
      premioPorUsuario,
      premios,
    ] = await Promise.all([
      prisma.bilhete.aggregate({
        _sum: { valor: true },
        where: {
          pago: true,
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.transacao_carteira.aggregate({
        _sum: { valor: true },
        where: {
          tipo: "PREMIO",
          status: "paid",
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.transacao_carteira.aggregate({
        _sum: { valor: true },
        where: {
          tipo: "SAQUE",
          status: "paid",
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.bilhete.groupBy({
        by: ["userId"],
        _sum: { valor: true },
        where: {
          pago: true,
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.transacao_carteira.groupBy({
        by: ["userId"],
        _sum: { valor: true },
        where: {
          tipo: "SAQUE",
          status: "paid",
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.transacao_carteira.groupBy({
        by: ["userId"],
        _sum: { valor: true },
        where: {
          tipo: "PREMIO",
          status: "paid",
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
      }),
      prisma.transacao_carteira.findMany({
        where: {
          tipo: "PREMIO",
          status: "paid",
          createdAt: {
            gte: inicio,
            lt: fim,
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          userId: true,
          valor: true,
          createdAt: true,
          metadata: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const userIdSet = new Set<number>();
    gastoPorUsuario.forEach((item) => userIdSet.add(item.userId));
    saquePorUsuario.forEach((item) => userIdSet.add(item.userId));
    premioPorUsuario.forEach((item) => userIdSet.add(item.userId));

    const userIds = Array.from(userIdSet);

    const usuariosBase =
      userIds.length > 0
        ? await prisma.users.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true },
          })
        : [];

    const nomePorUserId = new Map<number, string>(
      usuariosBase.map((u) => [u.id, u.name])
    );

    const usuariosMap = new Map<number, UserFinanceRow>();

    const ensureRow = (userId: number) => {
      if (!usuariosMap.has(userId)) {
        usuariosMap.set(userId, {
          userId,
          nome: nomePorUserId.get(userId) || "Usuário sem nome",
          totalGasto: 0,
          totalSacado: 0,
          totalPremio: 0,
        });
      }
      return usuariosMap.get(userId)!;
    };

    gastoPorUsuario.forEach((item) => {
      const row = ensureRow(item.userId);
      row.totalGasto = Number(item._sum.valor) || 0;
    });

    saquePorUsuario.forEach((item) => {
      const row = ensureRow(item.userId);
      row.totalSacado = Number(item._sum.valor) || 0;
    });

    premioPorUsuario.forEach((item) => {
      const row = ensureRow(item.userId);
      row.totalPremio = Number(item._sum.valor) || 0;
    });

    const usuarios = Array.from(usuariosMap.values()).sort(
      (a, b) => b.totalGasto - a.totalGasto
    );

    const premiosDetalhados = premios.map((premio) => {
      const metadata =
        premio.metadata && typeof premio.metadata === "object"
          ? (premio.metadata as Record<string, unknown>)
          : null;

      const bilheteIdRaw =
        metadata?.bilheteId ??
        metadata?.bilheteid ??
        metadata?.ticketId ??
        metadata?.ticketid ??
        null;

      return {
        userId: premio.userId,
        nome: premio.user.name,
        valor: Number(premio.valor) || 0,
        data: premio.createdAt,
        bilheteId:
          bilheteIdRaw !== null && bilheteIdRaw !== undefined
            ? Number(bilheteIdRaw)
            : null,
      };
    });

    const arrecadado = Number(arrecadadoAgg._sum.valor) || 0;
    const premiosPagos = Number(premiosPagosAgg._sum.valor) || 0;
    const saquesPagos = Number(saquesPagosAgg._sum.valor) || 0;

    return res.json({
      resumo: {
        arrecadado,
        premiosPagos,
        saquesPagos,
        lucroLiquido: arrecadado - premiosPagos - saquesPagos,
      },
      usuarios,
      premios: premiosDetalhados,
    });
  } catch (error) {
    console.error("Erro admin relatórios v2:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao gerar relatórios v2",
    });
  }
});

export default router;
