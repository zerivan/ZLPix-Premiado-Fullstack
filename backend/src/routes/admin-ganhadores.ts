import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — RESULTADO DO SORTEIO
 * =====================================================
 * REGRA:
 * - Mostra TODOS os bilhetes já apurados
 * - Permite filtrar por sorteioData (opcional)
 * - Apenas ESPELHA o banco
 */
router.get("/", async (req, res) => {
  try {
    const { sorteioData } = req.query;

    const whereClause: any = {
      apuradoEm: { not: null },
    };

    // 🔒 Filtro opcional por data de sorteio
    if (sorteioData) {
      const data = new Date(String(sorteioData));
      if (!isNaN(data.getTime())) {
        whereClause.sorteioData = data;
      }
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: whereClause,
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

    const lista = bilhetes.map((b) => ({
      id: b.id,
      userId: b.user.id,
      nome: b.user.name,
      email: b.user.email,
      telefone: b.user.phone,
      pixKey: b.user.pixKey,
      dezenas: b.dezenas,
      status: b.status,
      premio: b.premioValor ?? 0,
      resultadoFederal: b.resultadoFederal,
      apuradoEm: b.apuradoEm,
      transacaoId: b.transacao?.id ?? null,
      transacaoStatus: b.transacao?.status ?? null,
    }));

    return res.json({
      ok: true,
      total: lista.length,
      data: lista,
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