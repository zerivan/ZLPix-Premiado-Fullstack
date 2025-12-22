import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * APARÊNCIA — ESPELHO DO FRONT-END
 * AparenciaControl.tsx
 * =====================================================
 */

/**
 * GET /api/admin/cms/app-appearance
 */
router.get("/app-appearance", async (_req, res) => {
  try {
    const record = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    const data = record?.contentHtml
      ? JSON.parse(record.contentHtml)
      : {
          primaryColor: "#4f46e5",
          secondaryColor: "#6366f1",
          accentColor: "#f59e0b",
          backgroundColor: "#ffffff",
          themeMode: "light",
          fontPrimary: "Inter",
          fontHeading: "Inter",
        };

    return res.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("Erro ao carregar aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao carregar aparência",
    });
  }
});

/**
 * POST /api/admin/cms/app-appearance
 */
router.post("/app-appearance", async (req, res) => {
  try {
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      themeMode,
      fontPrimary,
      fontHeading,
    } = req.body;

    const payload = {
      primaryColor,
      secondaryColor,
      accentColor,
      backgroundColor,
      themeMode,
      fontPrimary,
      fontHeading,
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
    console.error("Erro ao salvar aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

export default router;