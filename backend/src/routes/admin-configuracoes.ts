import express from "express";
import { prisma } from "../lib/prisma";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

/**
 * GET — Buscar configurações (singleton)
 */
router.get("/", adminAuth, async (_req, res) => {
  try {
    const rows: any[] = await prisma.$queryRaw`
      SELECT
        "modoManutencao",
        "diagnosticoIA",
        "painelFinanceiro"
      FROM admin_configuracoes
      WHERE id = 1
      LIMIT 1
    `;

    let config = rows[0];

    if (!config) {
      await prisma.$executeRaw`
        INSERT INTO admin_configuracoes
        (id, "modoManutencao", "diagnosticoIA", "painelFinanceiro")
        VALUES (1, false, true, false)
      `;

      config = {
        modoManutencao: false,
        diagnosticoIA: true,
        painelFinanceiro: false,
      };
    }

    return res.json({ ok: true, data: config });
  } catch (err) {
    console.error("Erro ao buscar configurações:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar configurações",
    });
  }
});

/**
 * POST — Salvar configurações
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      modoManutencao,
      diagnosticoIA,
      painelFinanceiro,
    } = req.body;

    await prisma.$executeRaw`
      UPDATE admin_configuracoes
      SET
        "modoManutencao" = ${Boolean(modoManutencao)},
        "diagnosticoIA" = ${Boolean(diagnosticoIA)},
        "painelFinanceiro" = ${Boolean(painelFinanceiro)}
      WHERE id = 1
    `;

    return res.json({
      ok: true,
      data: {
        modoManutencao: Boolean(modoManutencao),
        diagnosticoIA: Boolean(diagnosticoIA),
        painelFinanceiro: Boolean(painelFinanceiro),
      },
    });
  } catch (err) {
    console.error("Erro ao salvar configurações:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar configurações",
    });
  }
});

export default router;