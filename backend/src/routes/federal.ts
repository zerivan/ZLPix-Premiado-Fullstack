import express from "express";

const router = express.Router();

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

    // ================================
    // EXTRAI CONCURSO
    // ================================
    let concurso = "N/A";
    const regexConcurso = /Concurso[^0-9]*([0-9]{3,6})/i;
    const concursoMatch = html.match(regexConcurso);
    if (concursoMatch) concurso = concursoMatch[1];

    // ================================
    // EXTRAI DATA (DD/MM/YYYY)
    // ================================
    let dataApuracao = "N/A";
    const regexData = /(\d{2}\/\d{2}\/\d{4})/;
    const dataMatch = html.match(regexData);
    if (dataMatch) dataApuracao = dataMatch[1];

    // ================================
    // EXTRAI 5 PRÊMIOS
    // ================================
    let premios: string[] = [];

    const regexPremiosTabela =
      /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;

    let m;
    while ((m = regexPremiosTabela.exec(html)) !== null) {
      premios.push(m[1]);
    }

    // fallback se a estrutura mudar
    if (premios.length < 5) {
      const fallback = [...html.matchAll(/(\d{5})/g)].map((v) => v[1]);
      premios = fallback.slice(0, 5);
    }

    if (premios.length < 5) {
      throw new Error("Não foi possível extrair os números premiados.");
    }

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios
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

export default router;