// backend/src/routes/admin-sorteio.ts
import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ======================================
 * POST /admin/sorteio/processar
 * ======================================
 * 🔒 Disparo MANUAL do sorteio (ADMIN)
 */
router.post("/processar", async (req, res) => {
  try {
    const { sorteioData, dezenas, premioTotal } = req.body;

    // =========================
    // VALIDAÇÕES DEFENSIVAS
    // =========================
    if (!sorteioData) {
      return res.status(400).json({
        success: false,
        reason: "Data do sorteio não informada",
      });
    }

    if (!Array.isArray(dezenas) || dezenas.length === 0) {
      return res.status(400).json({
        success: false,
        reason: "Dezenas inválidas ou vazias",
      });
    }

    const premio = Number(premioTotal);
    if (!premio || premio <= 0) {
      return res.status(400).json({
        success: false,
        reason: "Prêmio total inválido",
      });
    }

    // =========================
    // PROCESSAMENTO REAL
    // =========================
    await processarSorteio(new Date(sorteioData), {
      dezenas,
      premioTotal: premio,
    });

    // Se chegou aqui, o service não lançou erro
    return res.json({
      success: true,
      message: "Sorteio processado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao processar sorteio:", err);
    return res.status(500).json({
      success: false,
      reason: "Erro interno ao processar sorteio",
    });
  }
});

export default router;