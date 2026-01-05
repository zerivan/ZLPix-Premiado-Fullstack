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
 * Retorna apenas o valor do prêmio atual.
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
 * Apenas leitura da aparência global do app.
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

export default router;