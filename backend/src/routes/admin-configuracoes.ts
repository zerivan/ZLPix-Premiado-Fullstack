import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * CONFIGURAÇÕES GERAIS DO SISTEMA
 * (armazenadas em AppContent como type = "config")
 * =====================================================
 */

const CONFIG_KEY = "configuracoes_gerais";

/**
 * =====================================================
 * BUSCAR CONFIGURAÇÕES
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const row = await prisma.appContent.findUnique({
      where: { key: CONFIG_KEY },
    });

    let data = {};

    if (row?.contentHtml) {
      try {
        data = JSON.parse(row.contentHtml);
      } catch {
        data = {};
      }
    }

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar configurações",
    });
  }
});

/**
 * =====================================================
 * SALVAR CONFIGURAÇÕES
 * =====================================================
 */
router.post("/", async (req, res) => {
  try {
    const payload = req.body || {};

    await prisma.appContent.upsert({
      where: { key: CONFIG_KEY },
      update: {
        title: "Configurações do Sistema",
        contentHtml: JSON.stringify(payload),
        type: "config",
      },
      create: {
        key: CONFIG_KEY,
        title: "Configurações do Sistema",
        contentHtml: JSON.stringify(payload),
        type: "config",
      },
    });

    return res.json({
      ok: true,
      data: payload,
    });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar configurações",
    });
  }
});

export default router;