import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

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
    console.error("Erro ao buscar conteúdo:", error);
    return res.status(500).json({ ok: false });
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
    console.error("Erro ao salvar conteúdo:", error);
    return res.status(500).json({ ok: false });
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
      data: content ? JSON.parse(content.contentHtml || "{}") : null,
    });
  } catch (error) {
    console.error("Erro ao buscar aparência:", error);
    return res.status(500).json({ ok: false });
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
    console.error("Erro ao salvar aparência:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;