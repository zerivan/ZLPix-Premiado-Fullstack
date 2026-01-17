import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ======================================
 * POST /api/admin/sorteio/processar
 * ======================================
 * 🔒 DISPARO MANUAL (ADMIN)
 * ⚠️ USO CONTROLADO (TESTE / EMERGÊNCIA)
 */
router.post("/processar", async (_req, res) => {
  try {
    const agora = new Date();

    const bilhete = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
    });

    if (!bilhete) {
      return res.json({
        ok: false,
        message: "Nenhum sorteio pendente encontrado",
      });
    }

    const sorteioData = bilhete.sorteioData;

    const dezenasFake = ["12", "45", "98"];

    const premioAgg = await prisma.bilhete.aggregate({
      where: {
        status: "ATIVO",
        sorteioData,
      },
      _sum: {
        valor: true,
      },
    });

    const premioTotal = Number(premioAgg._sum.valor || 0);

    await processarSorteio(sorteioData, {
      dezenas: dezenasFake,
      premioTotal,
    });

    return res.json({
      ok: true,
      message: "Sorteio processado manualmente com sucesso",
    });
  } catch (err) {
    console.error("❌ Erro admin sorteio:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao processar sorteio",
    });
  }
});

export default router;