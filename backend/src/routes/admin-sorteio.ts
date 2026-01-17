// backend/src/routes/admin-sorteio.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ======================================
 * POST /api/admin/sorteio/processar
 * ======================================
 * 🔒 Disparo manual do sorteio (ADMIN)
 * - Varre bilhetes ATIVOS
 * - Respeita data do sorteio
 * - Se não houver sorteio válido, retorna feedback claro
 */
router.post("/processar", async (_req, res) => {
  try {
    const agora = new Date();

    // 🔍 Busca bilhetes ATIVOS cujo sorteio já venceu
    const bilheteElegivel = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
    });

    // 🚫 Nenhum sorteio válido no momento
    if (!bilheteElegivel) {
      return res.json({
        ok: true,
        status: "NO_DRAW",
        message:
          "Nenhum sorteio válido para a data atual. O sistema verificou os bilhetes e não encontrou sorteio elegível.",
      });
    }

    const sorteioData = bilheteElegivel.sorteioData;

    // ⚠️ Resultado ainda será oficial no futuro
    // Aqui usamos placeholder apenas para validação do fluxo
    const dezenasFake = ["00", "11", "22"];

    const premioTotal = await prisma.bilhete.aggregate({
      where: {
        status: "ATIVO",
        sorteioData,
      },
      _sum: {
        valor: true,
      },
    });

    await processarSorteio(sorteioData, {
      dezenas: dezenasFake,
      premioTotal: Number(premioTotal._sum.valor || 0),
    });

    return res.json({
      ok: true,
      status: "DRAW_PROCESSED",
      message: "Sorteio processado com sucesso",
    });
  } catch (err) {
    console.error("❌ Erro ao processar sorteio:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao processar sorteio",
    });
  }
});

export default router;