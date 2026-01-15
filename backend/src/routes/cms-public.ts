import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

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
      where: { key: "premio_atual" },
    });

    const valor = row?.contentHtml
      ? Number(row.contentHtml)
      : 500;

    return res.json({
      ok: true,
      data: {
        valor: isNaN(valor) ? 500 : valor,
      },
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
 * 🎨 APARÊNCIA — PÚBLICO
 * =====================================================
 */
router.get("/app-appearance", async (_req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    const DEFAULT_APPEARANCE = {
      primaryColor: "#4f46e5",
      secondaryColor: "#6366f1",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      themeMode: "light",
      fontPrimary: "Inter",
      fontHeading: "Inter",
    };

    let data = DEFAULT_APPEARANCE;

    if (content?.contentHtml) {
      try {
        data = JSON.parse(content.contentHtml);
      } catch {}
    }

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("Erro aparência pública:", error);
    return res.status(500).json({ ok: false });
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
        isActive: true, // ✅ ÚNICA ALTERAÇÃO REAL
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