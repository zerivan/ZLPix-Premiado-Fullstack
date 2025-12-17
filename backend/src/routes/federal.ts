import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Calcula a próxima quarta-feira (20h)
 */
function getNextWednesday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

/**
 * =====================================================
 * ROTA FEDERAL — SCRAPING CAIXA (INALTERADA)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://loterias.caixa.gov.br/Paginas/Federal.aspx",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9",
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
      premios = [...html.matchAll(/(\d{5})/g)].map(v => v[1]).slice(0, 5);
    }

    if (premios.length < 5) {
      throw new Error("Falha ao extrair prêmios");
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime(),
      },
    });
  } catch (err) {
    console.error("Erro scraping Caixa:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao consultar resultados",
    });
  }
});

/**
 * =====================================================
 * CMS SIMPLES — AppContent (ALINHADO AO PRISMA)
 * =====================================================
 */

/**
 * GET — conteúdo por key
 */
router.get("/admin/content/:key", async (req, res) => {
  try {
    const content = await prisma.appContent.findUnique({
      where: { key: req.params.key },
    });

    return res.json({ ok: true, data: content });
  } catch (err) {
    console.error("Erro ao buscar conteúdo:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao buscar conteúdo",
    });
  }
});

/**
 * POST — cria ou atualiza conteúdo
 */
router.post("/admin/content", async (req, res) => {
  try {
    const { key, title, contentHtml } = req.body;

    const content = await prisma.appContent.upsert({
      where: { key },
      update: { title, contentHtml },
      create: { key, title, contentHtml },
    });

    return res.json({ ok: true, data: content });
  } catch (err) {
    console.error("Erro ao salvar conteúdo:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao salvar conteúdo",
    });
  }
});

/**
 * GET — páginas públicas (por key)
 */
router.get("/pages/:key", async (req, res) => {
  try {
    const page = await prisma.appContent.findUnique({
      where: { key: req.params.key },
    });

    if (!page) {
      return res.status(404).json({ ok: false });
    }

    return res.json({ ok: true, data: page });
  } catch (err) {
    console.error("Erro ao buscar página:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao buscar página",
    });
  }
});

export default router;