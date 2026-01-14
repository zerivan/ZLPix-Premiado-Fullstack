import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import sanitizeHtml from "sanitize-html";

const router = Router();

/**
 * =====================================================
 * ÁREAS REAIS DO APP (HTML POR PÁGINA)
 * =====================================================
 */
const CMS_AREAS = [
  // HOME
  { key: "home_info", page: "home", title: "Home – Texto Topo" },
  { key: "home_card_info", page: "home", title: "Home – Texto do Card" },
  { key: "home_extra_info", page: "home", title: "Home – Texto Abaixo do Botão" },
  { key: "home_footer", page: "home", title: "Home – Como Funciona" },

  // OUTRAS PÁGINAS
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
  home_card_info: "",
  home_extra_info: "",
  home_footer: "",

  resultado_info: "",
  pix_info: "",
  perfil_info: "",
  carteira_info: "",
};

/**
 * =====================================================
 * FUNÇÃO DE SANITIZAÇÃO (XSS)
 * =====================================================
 */
function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
  });
}

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
    const pages = Array.from(new Set(CMS_AREAS.map((a) => a.page))).map(
      (page) => ({
        key: page,
        page,
        title: page.charAt(0).toUpperCase() + page.slice(1),
      })
    );

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

  if (
    cmsCache.areas[cacheKey] &&
    now - cmsCache.areas[cacheKey].timestamp < 30000
  ) {
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

    // 🔐 SANITIZAÇÃO XSS (OBRIGATÓRIA)
    const safeHtml = sanitizeContent(contentHtml || "");

    const saved = await prisma.appContent.upsert({
      where: { key },
      update: { title, contentHtml: safeHtml, type: "content" },
      create: { key, title, contentHtml: safeHtml, type: "content" },
    });

    // limpa cache da página
    Object.keys(cmsCache.areas).forEach((k) => {
      if (k.includes("home") || k.includes(key)) delete cmsCache.areas[k];
    });

    return res.json({ ok: true, data: saved });
  } catch (err) {
    console.error("❌ Erro ao salvar área CMS:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;