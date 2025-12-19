import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * =====================================================
 * UTIL — Próxima quarta-feira às 20h
 * =====================================================
 */
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = domingo
  const diff = (3 - day + 7) % 7 || 7; // 3 = quarta
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

/**
 * =====================================================
 * API PÚBLICA — FEDERAL (SCRAPING CAIXA)
 * GET /api/federal
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://loterias.caixa.gov.br/Paginas/Federal.aspx",
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "text/html",
        },
      }
    );

    const html = await response.text();

    let concurso = "N/A";
    const concursoMatch = html.match(/Concurso[^0-9]*([0-9]{3,6})/i);
    if (concursoMatch) concurso = concursoMatch[1];

    let dataApuracao = "N/A";
    const dataMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dataMatch) dataApuracao = dataMatch[1];

    let premios: string[] = [];
    const regex =
      /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;

    let m;
    while ((m = regex.exec(html)) !== null) {
      premios.push(m[1]);
    }

    if (premios.length < 5) {
      premios = [...html.matchAll(/(\d{5})/g)]
        .map(v => v[1])
        .slice(0, 5);
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro Federal:", error);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — APARÊNCIA GLOBAL DO APP
 * =====================================================
 */

// GET aparência
router.get("/app-appearance", async (_req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: "app_appearance" },
    });

    return res.json({
      ok: true,
      data: content ? JSON.parse(content.contentHtml || "{}") : null,
    });
  } catch (error) {
    console.error("Erro aparência:", error);
    return res.status(500).json({ ok: false });
  }
});

// POST aparência
router.post("/app-appearance", async (req, res) => {
  try {
    const data = req.body;

    const saved = await prisma.appContent.upsert({
      where: { key: "app_appearance" },
      update: {
        title: "Aparência do App",
        contentHtml: JSON.stringify(data),
      },
      create: {
        key: "app_appearance",
        title: "Aparência do App",
        contentHtml: JSON.stringify(data),
      },
    });

    return res.json({
      ok: true,
      data: JSON.parse(saved.contentHtml || "{}"),
    });
  } catch (error) {
    console.error("Erro salvar aparência:", error);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * CMS — CONTEÚDO PÚBLICO
 * =====================================================
 */

// GET conteúdo por chave
router.get("/content/:key", async (req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: req.params.key },
    });

    return res.json({ ok: true, data: content });
  } catch (error) {
    console.error("Erro conteúdo:", error);
    return res.status(500).json({ ok: false });
  }
});

// GET página pública
router.get("/pages/:key", async (req, res) => {
  try {
    const page = await prisma.appContent.findUnique({
      where: { key: req.params.key },
    });

    if (!page) {
      return res.status(404).json({ ok: false });
    }

    return res.json({ ok: true, data: page });
  } catch (error) {
    console.error("Erro página:", error);
    return res.status(500).json({ ok: false });
  }
});

export default router;