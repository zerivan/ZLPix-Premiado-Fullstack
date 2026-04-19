import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();
const PREMIO_INICIAL = 500;
const PREMIO_ATUAL_KEY = "premio_atual_ciclo";

/**
 * =====================================================
 * CMS PÚBLICO — SOMENTE LEITURA
 * =====================================================
 * ✔ SEM adminAuth
 * ✔ SEM token
 * ✔ NÃO interfere no painel ADM
 * ✔ USADO PELO APP / HOME / CLIENTE
 */

/**
 * =====================================================
 * 🏆 PRÊMIO ATUAL — PÚBLICO
 * =====================================================
 */
router.get("/premio", async (_req, res) => {
  try {
    const row = await prisma.appContent.findUnique({
      where: { key: PREMIO_ATUAL_KEY },
      select: { contentHtml: true },
    });

    const valor = Number(row?.contentHtml ?? PREMIO_INICIAL);

    return res.json({
      ok: true,
      valor: Number.isFinite(valor) ? Number(valor.toFixed(2)) : PREMIO_INICIAL,
    });
  } catch (error) {
    console.error("Erro prêmio público:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar prêmio",
    });
  }
});

/**
 * =====================================================
 * 📄 CMS PÚBLICO — HTML POR PÁGINA
 * =====================================================
 * ✔ FILTRA APENAS CONTEÚDO ATIVO
 * ✔ NÃO MUDA ROTA
 * ✔ NÃO MUDA FORMATO
 */
router.get("/:page", async (req, res) => {
  try {
    const { page } = req.params;

    const areas = await prisma.appContent.findMany({
      where: {
        key: {
          startsWith: `${page}_`,
        },
        isActive: true,
      },
      orderBy: {
        key: "asc",
      },
    });

    return res.json({
      ok: true,
      data: areas.map((a) => ({
        key: a.key,
        contentHtml: a.contentHtml,
      })),
    });
  } catch (error) {
    console.error("Erro CMS público página:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao carregar CMS público",
    });
  }
});

export default router;