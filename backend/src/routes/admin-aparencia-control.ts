import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

/**
 * GET — Buscar aparência do app
 */
router.get("/app-appearance", adminAuth, async (_req: Request, res: Response) => {
  try {
    const appearance = await prisma.appAppearance.findFirst();

    if (!appearance) {
      return res.json({
        ok: true,
        data: null,
      });
    }

    return res.json({
      ok: true,
      data: {
        primaryColor: appearance.primaryColor,
        secondaryColor: appearance.secondaryColor,
        accentColor: appearance.accentColor,
        backgroundColor: appearance.backgroundColor,
        themeMode: appearance.themeMode,
        fontPrimary: appearance.fontPrimary,
        fontHeading: appearance.fontHeading,
      },
    });
  } catch (error) {
    console.error("Erro ao carregar aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao carregar aparência",
    });
  }
});

/**
 * POST — Salvar aparência do app
 */
router.post("/app-appearance", adminAuth, async (req: Request, res: Response) => {
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

    // remove registros antigos (1 config ativa)
    await prisma.appAppearance.deleteMany();

    const created = await prisma.appAppearance.create({
      data: {
        primaryColor,
        secondaryColor,
        accentColor,
        backgroundColor,
        themeMode,
        fontPrimary,
        fontHeading,
      },
    });

    return res.json({
      ok: true,
      data: created,
    });
  } catch (error) {
    console.error("Erro ao salvar aparência:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro interno ao salvar aparência",
    });
  }
});

export default router;