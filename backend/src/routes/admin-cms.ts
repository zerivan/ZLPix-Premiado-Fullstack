import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * CMS — LISTAR TODO CONTEÚDO (PAINEL ADMIN)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const pages = await prisma.appContent.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        key: true,
        slug: true,
        title: true,
        enabled: true,
      },
    });

    return res.json({
      ok: true,
      data: pages,
    });
  } catch (error) {
    console.error("Erro CMS listar:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao listar conteúdo",
    });
  }
});

/**
 * =====================================================
 * CMS — CONTEÚDO (HTML / PÁGINAS)
 * =====================================================
 */

// GET conteúdo por key
router.get("/content/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const content = await prisma.appContent.findUnique({
      where: { key },
    });

    return res.json({
      ok: true,
      data: content
        ? {
            key: content.key,
            title: content.title,
            contentHtml: content.contentHtml,
          }
        : null,
    });
  } catch (error) {
    console.error("Erro CMS content:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar conteúdo",
    });
  }
});

// POST salvar conteúdo
router.post("/content", async (req, res) => {
  try {
    const { key, title, contentHtml } = req.body;

    if (!key || !title) {
      return res.status(400).json({
        ok: false,
        error: "Key e title são obrigatórios",
      });
    }

    const saved = await prisma.appContent.upsert({
      where: { key },
      update: {
        title,
        contentHtml,
      },
      create: {
        key,
        title,
        contentHtml,
      },
    });

    return res.json({
      ok: true,
      data: {
        key: saved.key,
        title: saved.title,
        contentHtml: saved.contentHtml,
      },
    });
  } catch (error) {
    console.error("Erro CMS salvar content:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar conteúdo",
    });
  }
});

/**
 * =====================================================
 * CMS — APARÊNCIA GLOBAL (ESPELHO DO FRONT)
 * =====================================================
 */

const DEFAULT_APPEARANCE = {
  primaryColor: "#4f46e5",
  secondaryColor: "#6366f1",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  themeMode: "light",
  fontPrimary: "Inter",
  fontHeading: "Inter",
};

router.get("/app-appearance", async (_req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    let data = DEFAULT_APPEARANCE;

    if (content?.contentHtml) {
      try {
        data = JSON.parse(content.contentHtml);
      } catch {
        data = DEFAULT_APPEARANCE;
      }
    }

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Erro CMS aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar aparência",
    });
  }
});

router.post("/app-appearance", async (req, res) => {
  try {
    const payload = {
      ...DEFAULT_APPEARANCE,
      ...req.body,
    };

    await prisma.appContent.upsert({
      where: { key: "app_appearance" },
      update: {
        title: "Aparência do App",
        contentHtml: JSON.stringify(payload),
      },
      create: {
        key: "app_appearance",
        title: "Aparência do App",
        contentHtml: JSON.stringify(payload),
      },
    });

    return res.json({
      ok: true,
      data: payload,
    });
  } catch (error) {
    console.error("Erro CMS salvar aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

export default router;