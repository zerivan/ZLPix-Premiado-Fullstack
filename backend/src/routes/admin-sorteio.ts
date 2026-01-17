import { Router } from "express";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ======================================
 * POST /api/admin/sorteio/processar
 * ======================================
 * Disparo manual de sorteio (ADMIN)
 */
router.post("/processar", async (_req, res) => {
  try {
    const agora = new Date();

    // 🔍 Verifica se existe algum bilhete elegível
    const bilheteElegivel = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
    });

    // ❌ Nenhum sorteio válido ainda
    if (!bilheteElegivel) {
      return res.json({
        status: "NO_DRAW",
        message:
          "Nenhum sorteio válido no momento. Bilhetes ainda não atingiram a data do sorteio.",
      });
    }

    const sorteioData = bilheteElegivel.sorteioData;

    // ⚠️ RESULTADO FAKE CONTROLADO (MODO TESTE)
    const dezenasFake = ["12", "45", "98"];

    const premioTotal = await prisma.bilhete.aggregate({
      where: {
        status: "ATIVO",
        sorteioData,
      },
      _sum: { valor: true },
    });

    await processarSorteio(sorteioData, {
      dezenas: dezenasFake,
      premioTotal: Number(premioTotal._sum.valor || 0),
    });

    return res.json({
      status: "DRAW_PROCESSED",
      message: "Sorteio processado com sucesso.",
    });
  } catch (err) {
    console.error("Erro ao processar sorteio:", err);
    return res.status(500).json({
      status: "ERROR",
      message: "Erro interno ao processar sorteio.",
    });
  }
});

export default router;