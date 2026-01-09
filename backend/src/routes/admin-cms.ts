import { Router, Request, Response } from "express";
import crypto from "crypto";
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
 * CACHE EM MEMÓRIA — PARA MELHOR PERFORMANCE
 * =====================================================
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cmsCache = {
  pages: null as any[] | null,
  areas: {} as Record<string, CacheEntry<any[]>>,
  lastPagesFetch: 0,
};

// Gera ETag a partir do JSON
const generateETag = (data: any): string =>
  `"${crypto.createHash("md5").update(JSON.stringify(data)).digest("hex")}"`;

/**
 * =====================================================
 * HTML PADRÃO
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
 * CMS — LISTAR TODAS AS ÁREAS
 * =====================================================
 */
router.get("/", async (_req: Request, res: Response) => {
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
  } catch (err) {
    console.error("❌ Erro ao listar áreas:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — LISTAR PÁGINAS (PAINEL ADMIN)
 * =====================================================
 */
router.get("/pages", async (_req: Request, res: Response) => {
  const now = Date.now();

  if (cmsCache.pages && now - cmsCache.lastPagesFetch < 30000) {
    const etag = generateETag(cmsCache.pages);
    res.set("ETag", etag);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    if (_req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    return res.json({ ok: true, pages: cmsCache.pages });
  }

  try {
    const pages = Array.from(
      new Set(CMS_AREAS.map((a) => a.page))
    ).map((page) => ({
      key: page,
      page,
      title: page.charAt(0).toUpperCase() + page.slice(1),
    }));

    cmsCache.pages = pages;
    cmsCache.lastPagesFetch = now;

    const etag = generateETag(pages);
    res.set("ETag", etag);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    return res.json({ ok: true, pages });
  } catch (err) {
    console.error("❌ Erro ao listar páginas CMS:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — LISTAR ÁREAS DE UMA PÁGINA
 * =====================================================
 */
router.get("/areas/:page", async (req: Request, res: Response) => {
  const { page } = req.params;
  const cacheKey = `areas_${page}`;
  const now = Date.now();

  if (cmsCache.areas[cacheKey] && now - cmsCache.areas[cacheKey].timestamp < 30000) {
    const etag = generateETag(cmsCache.areas[cacheKey].data);
    res.set("ETag", etag);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    return res.json({ ok: true, areas: cmsCache.areas[cacheKey].data });
  }

  try {
    const areas = CMS_AREAS.filter((a) => a.page === page);
    const contents = await prisma.appContent.findMany({
      where: { key: { in: areas.map((a) => a.key) } },
    });

    const data = areas.map((a) => {
      const found = contents.find((c) => c.key === a.key);
      return {
        key: a.key,
        title: found?.title || a.title,
        contentHtml: found?.contentHtml ?? DEFAULT_HTML[a.key] ?? "",
      };
    });

    cmsCache.areas[cacheKey] = { data, timestamp: now };

    const etag = generateETag(data);
    res.set("ETag", etag);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    return res.json({ ok: true, areas: data });
  } catch (err) {
    console.error("❌ Erro ao listar áreas da página:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — SALVAR ÁREA (PAINEL ADMIN)
 * =====================================================
 */
router.post("/area/save", async (req: Request, res: Response) => {
  try {
    const { key, title, contentHtml } = req.body;

    if (!CMS_AREAS.find((a) => a.key === key)) {
      return res.status(400).json({ ok: false, error: "Área inválida" });
    }

    const saved = await prisma.appContent.upsert({
      where: { key },
      update: { title, contentHtml, type: "content" },
      create: { key, title, contentHtml, type: "content" },
    });

    // limpa cache da área salva
    Object.keys(cmsCache.areas).forEach((k) => {
      if (k.includes(key)) delete cmsCache.areas[k];
    });

    return res.json({ ok: true, data: saved });
  } catch (err) {
    console.error("❌ Erro ao salvar área CMS:", err);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * APARÊNCIA — PADRÃO + ADMIN + PÚBLICO
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

router.get("/app-appearance", async (_req: Request, res: Response) => {
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
  } catch (err) {
    console.error("❌ Erro ao carregar aparência:", err);
    return res.status(500).json({ ok: false });
  }
});

router.post("/app-appearance", async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error("❌ Erro ao salvar aparência:", err);
    return res.status(500).json({ ok: false });
  }
});

router.get("/public/app-appearance", async (_req: Request, res: Response) => {
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
  } catch (err) {
    console.error("❌ Erro ao carregar aparência pública:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;
