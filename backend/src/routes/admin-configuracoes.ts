import express from "express";
import { prisma } from "../lib/prisma";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

/**
 * GET — Buscar configurações do sistema (singleton)
 */
router.get("/", adminAuth, async (_req, res) => {
  try {
    let config = await prisma.adminConfiguracoes.findUnique({
      where: { id: 1 },
    });

    if (!config) {
      config = await prisma.adminConfiguracoes.create({
        data: {
          id: 1,
          modoManutencao: false,
          diagnosticoIA: true,
          painelFinanceiro: false,
        },
      });
    }

    return res.json({
      ok: true,
      data: {
        modoManutencao: config.modoManutencao,
        diagnosticoIA: config.diagnosticoIA,
        painelFinanceiro: config.painelFinanceiro,
      },
    });
  } catch (err) {
    console.error("Erro ao buscar configurações:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar configurações do sistema",
    });
  }
});

/**
 * POST — Salvar configurações do sistema
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const {
      modoManutencao,
      diagnosticoIA,
      painelFinanceiro,
    } = req.body;

    const updated = await prisma.adminConfiguracoes.upsert({
      where: { id: 1 },
      update: {
        modoManutencao: Boolean(modoManutencao),
        diagnosticoIA: Boolean(diagnosticoIA),
        painelFinanceiro: Boolean(painelFinanceiro),
      },
      create: {
        id: 1,
        modoManutencao: Boolean(modoManutencao),
        diagnosticoIA: Boolean(diagnosticoIA),
        painelFinanceiro: Boolean(painelFinanceiro),
      },
    });

    return res.json({
      ok: true,
      data: {
        modoManutencao: updated.modoManutencao,
        diagnosticoIA: updated.diagnosticoIA,
        painelFinanceiro: updated.painelFinanceiro,
      },
    });
  } catch (err) {
    console.error("Erro ao salvar configurações:", err);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar configurações do sistema",
    });
  }
});

export default router;