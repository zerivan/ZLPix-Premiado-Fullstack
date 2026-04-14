import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const DIAS_PERMANENCIA = 7;

router.get("/", async (req, res) => {
  try {
    const { sorteioData } = req.query;

    const agora = new Date();

    const whereClause: any = {};

    // 🔒 Filtro opcional por data específica
    if (sorteioData) {
      const data = new Date(String(sorteioData));
      if (!isNaN(data.getTime())) {
        whereClause.sorteioData = data;
      }
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
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

    // 🔥 DEBUG TEMPORÁRIO (NÃO ALTERA COMPORTAMENTO)
    const ativos = bilhetes.filter((b) => !b.apuradoEm);
    const apurados = bilhetes.filter((b) => b.apuradoEm);

    console.log("📊 [ADMIN-GANHADORES]");
    console.log("Total:", bilhetes.length);
    console.log("Ativos:", ativos.length);
    console.log("Apurados:", apurados.length);

    // 🔥 NOVA REGRA:
    // ATIVOS + APURADOS (7 dias)
    const bilhetesFiltrados = bilhetes.filter((b) => {
      // ✔ ATIVO
      if (!b.apuradoEm) return true;

      // ✔ APURADO (regra de 7 dias)
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