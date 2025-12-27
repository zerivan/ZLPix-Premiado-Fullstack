import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ÁREAS FIXAS DO CMS (APP INTEIRO)
 * =====================================================
 */
const CMS_AREAS = [
  { key: "home", title: "Página Inicial" },
  { key: "resultado", title: "Resultados" },
  { key: "ajuda", title: "Ajuda" },
  { key: "termos", title: "Termos de Uso" },
  { key: "pix", title: "Informações PIX" },
  { key: "perfil", title: "Perfil do Usuário" },
  { key: "carteira", title: "Carteira" },
];

/**
 * =====================================================
 * CMS — LISTAR TODAS AS ÁREAS (PAINEL ADMIN)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const contents = await prisma.appContent.findMany();

    const merged = CMS_AREAS.map((area) => {
      const found = contents.find((c) => c.key === area.key);

      return {
        key: area.key,
        title: found?.title || area.title,
        enabled: true,
        hasContent: !!found?.contentHtml,
      };
    });

    return res.json({
      ok: true,
      data: merged,
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
 * CMS — BUSCAR CONTEÚDO POR KEY
 * =====================================================
 */
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
        : {
            key,
            title: CMS_AREAS.find((a) => a.key === key)?.title || "",
            contentHtml: "",
          },
    });
  } catch (error) {
    console.error("Erro CMS content:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar conteúdo",
    });
  }
});

/**
 * =====================================================
 * CMS — SALVAR CONTEÚDO
 * =====================================================
 */
router.post("/content", async (req, res) => {
  try {
    const { key, title, contentHtml } = req.body;

    if (!key) {
      return res.status(400).json({
        ok: false,
        error: "Key é obrigatória",
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
    console.error("Erro CMS salvar:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar conteúdo",
    });
  }
});

/**
 * =====================================================
 * CMS — APARÊNCIA GLOBAL
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
      } catch {}
    }

    return res.json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar aparência",
    });
  }
});

router.post("/app-appearance", async (req, res) => {
  try {
    const payload = { ...DEFAULT_APPEARANCE, ...req.body };

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

    return res.json({ ok: true, data: payload });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

export default router;