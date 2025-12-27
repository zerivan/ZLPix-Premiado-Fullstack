import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ÁREAS REAIS DO APP (HTML POR PÁGINA)
 * =====================================================
 */
const CMS_AREAS = [
  // HOME
  { key: "home_info", page: "home", title: "Home – Texto Informativo" },
  { key: "home_footer", page: "home", title: "Home – Rodapé" },

  // RESULTADO
  { key: "resultado_info", page: "resultado", title: "Resultado – Informações" },

  // PIX
  { key: "pix_info", page: "pix", title: "PIX – Informações" },

  // PERFIL
  { key: "perfil_info", page: "perfil", title: "Perfil – Informações" },

  // CARTEIRA
  { key: "carteira_info", page: "carteira", title: "Carteira – Informações" },
];

/**
 * =====================================================
 * CMS — LISTAR TODAS AS ÁREAS (PAINEL ADMIN)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const contents = await prisma.appContent.findMany({
      where: { type: "content" },
    });

    const merged = CMS_AREAS.map((area) => {
      const found = contents.find((c) => c.key === area.key);

      return {
        key: area.key,
        page: area.page,
        title: found?.title || area.title,
        enabled: true,
        hasContent: !!found?.contentHtml,
      };
    });

    return res.json({ ok: true, data: merged });
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
 * CMS — BUSCAR ÁREAS DE UMA PÁGINA (ADMIN)
 * =====================================================
 */
router.get("/content/:page", async (req, res) => {
  try {
    const { page } = req.params;

    const areas = CMS_AREAS.filter((a) => a.page === page);

    const contents = await prisma.appContent.findMany({
      where: {
        key: { in: areas.map((a) => a.key) },
        type: "content",
      },
    });

    const result = areas.map((area) => {
      const found = contents.find((c) => c.key === area.key);

      return {
        key: area.key,
        title: found?.title || area.title,
        contentHtml: found?.contentHtml || "",
      };
    });

    return res.json({ ok: true, data: result });
  } catch (error) {
    console.error("Erro CMS content page:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar conteúdo",
    });
  }
});

/**
 * =====================================================
 * CMS — SALVAR CONTEÚDO (ADMIN)
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
        type: "content",
      },
      create: {
        key,
        title,
        contentHtml,
        type: "content",
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
 * CMS — CONTEÚDO PÚBLICO (APP)
 * 👉 USADO PELO FRONT-END
 * 👉 NÃO EXIGE TOKEN
 * =====================================================
 * GET /api/admin/cms/public/home
 */
router.get("/public/:page", async (req, res) => {
  try {
    const { page } = req.params;

    const areas = CMS_AREAS.filter((a) => a.page === page);

    const contents = await prisma.appContent.findMany({
      where: {
        key: { in: areas.map((a) => a.key) },
        type: "content",
      },
      orderBy: { key: "asc" },
    });

    return res.json({
      ok: true,
      data: contents.map((c) => ({
        key: c.key,
        title: c.title,
        contentHtml: c.contentHtml || "",
      })),
    });
  } catch (error) {
    console.error("Erro CMS público:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar conteúdo público",
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
  } catch {
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
        type: "config",
      },
      create: {
        key: "app_appearance",
        title: "Aparência do App",
        contentHtml: JSON.stringify(payload),
        type: "config",
      },
    });

    return res.json({ ok: true, data: payload });
  } catch {
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

export default router;