import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ÁREAS REAIS DO APP (HTML POR PÁGINA)
 * =====================================================
 */
const CMS_AREAS = [
  { key: "home_info", page: "home", title: "Home – Texto Informativo" },
  { key: "home_footer", page: "home", title: "Home – Rodapé" },

  { key: "resultado_info", page: "resultado", title: "Resultado – Informações" },
  { key: "pix_info", page: "pix", title: "PIX – Informações" },
  { key: "perfil_info", page: "perfil", title: "Perfil – Informações" },
  { key: "carteira_info", page: "carteira", title: "Carteira – Informações" },
];

/**
 * =====================================================
 * HTML PADRÃO (FONTE ÚNICA DE VERDADE)
 * =====================================================
 */
const DEFAULT_HTML: Record<string, string> = {
  home_info: "",
  home_footer: "",
  resultado_info: "",
  pix_info: "",
  perfil_info: "",
  carteira_info: "",
};

/**
 * =====================================================
 * CMS — LISTAR ÁREAS (ADMIN)
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
        hasContent: !!found?.contentHtml,
      };
    });

    return res.json({ ok: true, data: merged });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — BUSCAR ÁREAS DE UMA PÁGINA (ADMIN)
 * 👉 SEM CRIAR CONTEÚDO AUTOMÁTICO
 * 👉 SEM DUPLICAR
 * =====================================================
 */
router.get("/content/:page", async (req, res) => {
  try {
    const { page } = req.params;

    const areas = CMS_AREAS.filter((a) => a.page === page);

    const contents = await prisma.appContent.findMany({
      where: { key: { in: areas.map((a) => a.key) } },
    });

    const data = areas.map((a) => {
      const found = contents.find((c) => c.key === a.key);

      return {
        key: a.key,
        title: found?.title || a.title,
        contentHtml:
          found?.contentHtml ?? DEFAULT_HTML[a.key] ?? "",
      };
    });

    return res.json({ ok: true, data });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — SALVAR CONTEÚDO (ADMIN)
 * 👉 SALVA SOMENTE A ÁREA EXISTENTE
 * =====================================================
 */
router.post("/content", async (req, res) => {
  try {
    const { key, title, contentHtml } = req.body;

    if (!CMS_AREAS.find((a) => a.key === key)) {
      return res.status(400).json({ ok: false });
    }

    const saved = await prisma.appContent.upsert({
      where: { key },
      update: { title, contentHtml, type: "content" },
      create: { key, title, contentHtml, type: "content" },
    });

    return res.json({ ok: true, data: saved });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * APARÊNCIA — PADRÃO
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

/**
 * =====================================================
 * APARÊNCIA — ADMIN
 * =====================================================
 */
router.get("/app-appearance", async (_req, res) => {
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
});

router.post("/app-appearance", async (req, res) => {
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
});

/**
 * =====================================================
 * 🔓 APARÊNCIA — PÚBLICO (APP)
 * =====================================================
 */
router.get("/public/app-appearance", async (_req, res) => {
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
    return res.status(500).json({ ok: false });
  }
});

export default router;