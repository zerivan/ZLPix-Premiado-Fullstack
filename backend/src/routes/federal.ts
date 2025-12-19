import express from "express";

const router = express.Router();

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
 * Extrai dezenas iniciais e finais de um número federal
 * Ex: 12345
 * iniciais: [12, 23, 34]
 * finais:   [45, 34, 23]
 */
function extrairDezenas(numero: string) {
  const chars = numero.split("");

  const inicio: string[] = [];
  const fim: string[] = [];

  // iniciais
  for (let i = 0; i < chars.length - 1; i++) {
    inicio.push(chars[i] + chars[i + 1]);
  }

  // finais
  for (let i = chars.length - 1; i > 0; i--) {
    fim.push(chars[i - 1] + chars[i]);
  }

  return { inicio, fim };
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

    let numeros: string[] = [];
    const regex =
      /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;

    let m;
    while ((m = regex.exec(html)) !== null) {
      numeros.push(m[1]);
    }

    if (numeros.length < 5) {
      numeros = [...html.matchAll(/(\d{5})/g)]
        .map(v => v[1])
        .slice(0, 5);
    }

    const premios = numeros.map(numero => ({
      numero,
      dezenas: extrairDezenas(numero),
    }));

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

export default router;