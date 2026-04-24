import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const DIAS_PERMANENCIA = 7;

/**
 * =====================================================
 * ADMIN — RESULTADO DO SORTEIO
 * =====================================================
 * REGRA:
 * - Mostra bilhetes já apurados
 * - Apenas dentro da janela de permanência (7 dias)
 * - Baseado exclusivamente em sorteioData
 * - Apenas ESPELHA o banco
 */
router.get("/", async (req, res) => {
  try {
    const { sorteioData } = req.query;

    const agora = new Date();

    const whereClause: any = {
      apuradoEm: { not: null },
    };

    // 🔒 Filtro opcional por data específica (se informado)
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

    // 🔥 Aplicação da regra de permanência (7 dias após 17h do sorteio)
    const bilhetesFiltrados = bilhetes.filter((b) => {
      if (!b.sorteioData) return false;

      const vencimento = new Date(b.sorteioData);
      vencimento.setHours(17, 0, 0, 0);

      const limite = new Date(vencimento);
      limite.setDate(limite.getDate() + DIAS_PERMANENCIA);

      return agora.getTime() <= limite.getTime();
    });

    const lista = bilhetesFiltrados.map((b) => ({
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