import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * ==========================================
 * CMS — CONTEÚDO (HTML / PÁGINAS)
 * ==========================================
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
      data: content,
    });
  } catch (error) {
    console.error("Erro ao buscar conteúdo CMS:", error);
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
      data: saved,
    });
  } catch (error) {
    console.error("Erro ao salvar conteúdo CMS:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar conteúdo",
    });
  }
});

/**
 * ==========================================
 * CMS — APARÊNCIA GLOBAL DO APP
 * ==========================================
 */

// GET aparência
router.get("/app-appearance", async (_req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    return res.json({
      ok: true,
      data: content?.contentHtml
        ? JSON.parse(content.contentHtml)
        : {
            primaryColor: "#4f46e5",
            secondaryColor: "#6366f1",
            accentColor: "#facc15",
            backgroundColor: "#ffffff",
            themeMode: "light",
            fontPrimary: "Inter",
            fontHeading: "Inter",
          },
    });
  } catch (error) {
    console.error("Erro ao buscar aparência CMS:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar aparência",
    });
  }
});

// POST salvar aparência
router.post("/app-appearance", async (req, res) => {
  try {
    const data = req.body;

    const saved = await prisma.appContent.upsert({
      where: { key: "app_appearance" },
      update: {
        title: "Aparência do App",
        contentHtml: JSON.stringify(data),
      },
      create: {
        key: "app_appearance",
        title: "Aparência do App",
        contentHtml: JSON.stringify(data),
      },
    });

    return res.json({
      ok: true,
      data: JSON.parse(saved.contentHtml || "{}"),
    });
  } catch (error) {
    console.error("Erro ao salvar aparência CMS:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

export default router;