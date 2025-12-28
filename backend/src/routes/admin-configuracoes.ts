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
 * 🔒 ESTRUTURA PADRÃO — NUNCA MUDA
 */
const DEFAULT_CONFIG = {
  modoManutencao: false,
  diagnosticoIA: true,
  painelFinanceiro: true,
};

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

    let data = DEFAULT_CONFIG;

    if (row?.contentHtml) {
      try {
        data = {
          ...DEFAULT_CONFIG,
          ...JSON.parse(row.contentHtml),
        };
      } catch {
        data = DEFAULT_CONFIG;
      }
    } else {
      // ⚠️ cria automaticamente se não existir
      await prisma.appContent.create({
        data: {
          key: CONFIG_KEY,
          title: "Configurações do Sistema",
          contentHtml: JSON.stringify(DEFAULT_CONFIG),
          type: "config",
        },
      });
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
    const payload = {
      ...DEFAULT_CONFIG,
      ...(req.body || {}),
    };

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