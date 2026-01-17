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

    if (!sorteioData || !Array.isArray(dezenas) || !premioTotal) {
      return res.status(400).json({
        ok: false,
        error: "Dados inválidos para processar sorteio",
      });
    }

    await processarSorteio(new Date(sorteioData), {
      dezenas,
      premioTotal: Number(premioTotal),
    });

    return res.json({
      ok: true,
      message: "Sorteio processado com sucesso",
    });
  } catch (err) {
    console.error("Erro ao processar sorteio:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao processar sorteio",
    });
  }
});

export default router;