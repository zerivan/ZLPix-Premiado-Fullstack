// backend/src/routes/admin-sorteio.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ============================
 * POST /api/admin/sorteio/processar
 * ============================
 * Disparo OFICIAL do sorteio
 * - Executa apenas uma vez por data
 * - Divide prêmio
 * - Credita carteiras
 */
router.post("/processar", async (req, res) => {
  try {
    const { sorteioData, dezenas, premioTotal } = req.body;

    if (
      !sorteioData ||
      !Array.isArray(dezenas) ||
      dezenas.length === 0 ||
      !premioTotal
    ) {
      return res.status(400).json({
        error: "Dados inválidos para processamento do sorteio",
      });
    }

    const dataSorteio = new Date(sorteioData);

    // 🔒 BLOQUEIO: já existe bilhete apurado nesse sorteio?
    const jaProcessado = await prisma.bilhete.findFirst({
      where: {
        sorteioData: dataSorteio,
        apuradoEm: { not: null },
      },
    });

    if (jaProcessado) {
      return res.status(400).json({
        error: "Este sorteio já foi processado",
      });
    }

    // 🚀 EXECUTA PROCESSADOR
    await processarSorteio(dataSorteio, {
      dezenas,
      premioTotal: Number(premioTotal),
    });

    // 🧾 MARCA BILHETES COMO APURADOS
    await prisma.bilhete.updateMany({
      where: {
        sorteioData: dataSorteio,
      },
      data: {
        resultadoFederal: dezenas.join(","),
        apuradoEm: new Date(),
      },
    });

    return res.json({
      ok: true,
      message: "Sorteio processado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao processar sorteio:", err);
    return res.status(500).json({
      error: "Erro interno ao processar sorteio",
    });
  }
});

export default router;