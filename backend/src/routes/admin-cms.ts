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
  { key: "home_info", page: "home", title: "Home – Texto Topo" },
  { key: "home_card_info", page: "home", title: "Home – Texto do Card" },
  { key: "home_extra_info", page: "home", title: "Home – Texto Abaixo do Botão" },
  { key: "home_footer", page: "home", title: "Home – Como Funciona" },

  { key: "resultado_info", page: "resultado", title: "Resultado – Informações" },
  { key: "pix_info", page: "pix", title: "PIX – Informações" },
  { key: "perfil_info", page: "perfil", title: "Perfil – Informações" },
  { key: "carteira_info", page: "carteira", title: "Carteira – Informações" },

  { key: "anuncio_main", page: "anuncio", title: "Anúncio – Conteúdo Principal" },

  { key: "federal_info", page: "federal", title: "Federal – Informações" },
  { key: "federal_data", page: "federal", title: "Federal – Data da Apuração" },
  { key: "federal_premio_1", page: "federal", title: "Federal – 1º Prêmio" },
  { key: "federal_premio_2", page: "federal", title: "Federal – 2º Prêmio" },
  { key: "federal_premio_3", page: "federal", title: "Federal – 3º Prêmio" },
  { key: "federal_premio_4", page: "federal", title: "Federal – 4º Prêmio" },
  { key: "federal_premio_5", page: "federal", title: "Federal – 5º Prêmio" },
];

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cmsCache = {
  pages: null as any[] | null,
  areas: {} as Record<string, CacheEntry<any[]>>,
  lastPagesFetch: 0,
};

const generateETag = (data: any): string =>
  `"${crypto.createHash("md5").update(JSON.stringify(data)).digest("hex")}"`;

const DEFAULT_HTML: Record<string, string> = {
  home_info: "",
  home_card_info: "",
  home_extra_info: "",
  home_footer: "",

  resultado_info: "",
  pix_info: "",
  perfil_info: "",
  carteira_info: "",

  anuncio_main: "",

federal_info: "",
federal_data: "",
federal_premio_1: "",
federal_premio_2: "",
federal_premio_3: "",
federal_premio_4: "",
federal_premio_5: "",
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
      "img", // ✅ liberado
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["style"],
      img: ["src", "alt", "title", "width", "height", "class"], // ✅ liberado
    },
    allowedSchemes: ["http", "https", "mailto", "data"], // ✅ permite base64
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
 * 🎨 APARÊNCIA DO APP (ADMIN)
 * =====================================================
 */
const DEFAULT_APPEARANCE = {
  primaryColor: "#4f46e5",
  secondaryColor: "#6366f1",
  accentColor: "#f59e0b",
  backgroundColor: "#ffffff",
  textColor: "#111827",
  textSecondaryColor: "#6b7280",
  buttonColor: "#4f46e5",
  buttonTextColor: "#ffffff",
  buttonHoverColor: "#4338ca",
  borderColor: "#e5e7eb",
  themeMode: "light",
  fontPrimary: "Inter",
  fontHeading: "Inter",
};

router.get("/app-appearance", async (_req: Request, res: Response) => {
  try {
    const record = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    let data = DEFAULT_APPEARANCE;

    if (record?.contentHtml) {
      try {
        data = JSON.parse(record.contentHtml);
      } catch {
        console.error("JSON inválido em app_appearance, usando padrão");
      }
    }

    return res.json({ ok: true, data });
  } catch (error) {
    console.error("Erro ao carregar aparência (admin):", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao carregar aparência",
    });
  }
});

router.post("/app-appearance", async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const payload = {
      ...DEFAULT_APPEARANCE,
      ...body,
      themeMode: body.themeMode === "dark" ? "dark" : "light",
    };

    await prisma.appContent.upsert({
      where: { key: "app_appearance" },
      update: {
        title: "Aparência do Aplicativo",
        contentHtml: JSON.stringify(payload),
      },
      create: {
        key: "app_appearance",
        title: "Aparência do Aplicativo",
        contentHtml: JSON.stringify(payload),
      },
    });

    return res.json({ ok: true, data: payload });
  } catch (error) {
    console.error("Erro ao salvar aparência (admin):", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao salvar aparência",
    });
  }
});

router.get("/pages", async (_req: Request, res: Response) => {
  const now = Date.now();

  if (cmsCache.pages && now - cmsCache.lastPagesFetch < 30000) {
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

    return res.json({ ok: true, pages });
  } catch (err) {
    console.error("Erro ao listar páginas CMS:", err);
    return res.status(500).json({ ok: false });
  }
});

router.get("/areas/:page", async (req: Request, res: Response) => {
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
        contentHtml: found?.contentHtml ?? DEFAULT_HTML[a.key] ?? "",
      };
    });

    return res.json({ ok: true, areas: data });
  } catch (err) {
    console.error("Erro ao listar áreas:", err);
    return res.status(500).json({ ok: false });
  }
});

router.post("/area/save", async (req: Request, res: Response) => {
  try {
    const { key, title, contentHtml } = req.body;

    if (!CMS_AREAS.find((a) => a.key === key)) {
      return res.status(400).json({ ok: false, error: "Área inválida" });
    }

    const safeHtml = sanitizeContent(contentHtml || "");

    const saved = await prisma.appContent.upsert({
      where: { key },
      update: { title, contentHtml: safeHtml, type: "content" },
      create: { key, title, contentHtml: safeHtml, type: "content" },
    });

    return res.json({ ok: true, data: saved });
  } catch (err) {
    console.error("Erro ao salvar área CMS:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;