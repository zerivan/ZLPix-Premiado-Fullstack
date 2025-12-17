import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Calcula a próxima quarta-feira (20h)
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
 * ROTA EXISTENTE — FEDERAL (NÃO ALTERADA)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://loterias.caixa.gov.br/Paginas/Federal.aspx",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9"
        }
      }
    );

    const html = await response.text();

    let concurso = "N/A";
    const regexConcurso = /Concurso[^0-9]*([0-9]{3,6})/i;
    const concursoMatch = html.match(regexConcurso);
    if (concursoMatch) concurso = concursoMatch[1];

    let dataApuracao = "N/A";
    const regexData = /(\d{2}\/\d{2}\/\d{4})/;
    const dataMatch = html.match(regexData);
    if (dataMatch) dataApuracao = dataMatch[1];

    let premios: string[] = [];
    const regexPremiosTabela =
      /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;

    let m;
    while ((m = regexPremiosTabela.exec(html)) !== null) {
      premios.push(m[1]);
    }

    if (premios.length < 5) {
      const fallback = [...html.matchAll(/(\d{5})/g)].map((v) => v[1]);
      premios = fallback.slice(0, 5);
    }

    if (premios.length < 5) {
      throw new Error("Não foi possível extrair os números premiados.");
    }

    const proximoSorteio = getNextWednesday();

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime()
      }
    });

  } catch (err) {
    console.error("Erro scraping Caixa:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao consultar os resultados da Caixa."
    });
  }
});

/**
 * =====================================================
 * MÓDULO 1 — APARÊNCIA DO APLICATIVO
 * =====================================================
 */

/**
 * GET — Busca configuração de aparência
 */
router.get("/admin/app-appearance", async (_req, res) => {
  try {
    const config = await prisma.appAppearance.findUnique({
      where: { id: 1 }
    });

    return res.json({
      ok: true,
      data: config
    });
  } catch (err) {
    console.error("Erro ao buscar AppAppearance:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao buscar configuração de aparência."
    });
  }
});

/**
 * POST — Cria ou atualiza configuração de aparência
 */
router.post("/admin/app-appearance", async (req, res) => {
  try {
    const data = req.body;

    const config = await prisma.appAppearance.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        ...data
      }
    });

    return res.json({
      ok: true,
      data: config
    });
  } catch (err) {
    console.error("Erro ao salvar AppAppearance:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao salvar configuração de aparência."
    });
  }
});

export default router;