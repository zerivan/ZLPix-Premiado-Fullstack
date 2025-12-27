import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * HOME HTML — ESPELHO DIRETO DA HOME DO APP
 * =====================================================
 * - NÃO é CMS genérico
 * - NÃO usa slug
 * - NÃO depende de seed
 * - 1 HTML = Home
 */

// 🔹 GET — buscar HTML da Home
router.get("/", async (_req, res) => {
  try {
    const row = await prisma.appContent.findUnique({
      where: { key: "home_html" },
    });

    return res.json({
      ok: true,
      data: {
        contentHtml: row?.contentHtml || "",
      },
    });
  } catch (error) {
    console.error("Erro home-html GET:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar HTML da Home",
    });
  }
});

// 🔹 POST — salvar HTML da Home
router.post("/", async (req, res) => {
  try {
    const { contentHtml } = req.body;

    await prisma.appContent.upsert({
      where: { key: "home_html" },
      update: {
        title: "HTML da Home",
        contentHtml,
      },
      create: {
        key: "home_html",
        title: "HTML da Home",
        contentHtml,
      },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro home-html POST:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar HTML da Home",
    });
  }
});

export default router;