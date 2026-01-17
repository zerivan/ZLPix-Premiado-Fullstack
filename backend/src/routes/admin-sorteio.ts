import { Router } from "express";

const router = Router();

/**
 * ======================================
 * POST /api/admin/sorteio/processar
 * ======================================
 * 🔒 Disparo manual do sorteio (ADMIN)
 * Este endpoint será o gatilho oficial
 * para processar sorteio, apurar ganhadores
 * e distribuir prêmios (lógica virá depois).
 */
router.post("/processar", async (_req, res) => {
  try {
    console.log("🟢 Sorteio disparado manualmente pelo ADMIN");

    return res.json({
      ok: true,
      message: "Disparo de sorteio recebido com sucesso",
    });
  } catch (err) {
    console.error("❌ Erro ao disparar sorteio:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao processar sorteio",
    });
  }
});

export default router;