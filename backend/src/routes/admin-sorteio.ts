import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ======================================
 * POST /api/admin/sorteio/processar
 * ======================================
 * 🔒 DISPARO OFICIAL DO SORTEIO (ADMIN)
 *
 * Espera no body:
 * {
 *   sorteioData: "2026-01-24T20:00:00.000Z",
 *   dezenas: ["12", "45", "98"],
 *   premioTotal: 1000
 * }
 */
router.post("/processar", async (req, res) => {
  try {
    const { sorteioData, dezenas, premioTotal } = req.body || {};

    // 🔐 VALIDAÇÕES BÁSICAS
    if (
      !sorteioData ||
      !Array.isArray(dezenas) ||
      dezenas.length === 0 ||
      !premioTotal ||
      Number(premioTotal) <= 0
    ) {
      return res.status(400).json({
        ok: false,
        error: "Dados do sorteio inválidos",
      });
    }

    console.log("🎯 Sorteio disparado pelo ADMIN:", {
      sorteioData,
      dezenas,
      premioTotal,
    });

    // 🚀 PROCESSAMENTO REAL
    await processarSorteio(new Date(sorteioData), {
      dezenas,
      premioTotal: Number(premioTotal),
    });

    return res.json({
      ok: true,
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