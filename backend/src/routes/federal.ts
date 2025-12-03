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
          "Accept-Language": "pt-BR,pt;q=0.9",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
        },
      }
    );

    const html = await response.text();

    // Extrair concurso
    const concursoMatch = html.match(/Concurso nº<\/span>\s*([\d]+)/);
    const concurso = concursoMatch ? concursoMatch[1] : "N/A";

    // Extrair data
    const dataMatch = html.match(/data do sorteio:\s*<\/span>\s*([^<]+)/i);
    const dataApuracao = dataMatch ? dataMatch[1].trim() : "N/A";

    // Extrair premiados
    const regexPremios =
      /<td class="w-25">([\d]+)<\/td>\s*<td class="w-75">([\d]+)/g;

    const premios: string[] = [];
    let m;

    while ((m = regexPremios.exec(html)) !== null) {
      premios.push(m[2]);
    }

    if (premios.length < 5) {
      throw new Error("Não foi possível extrair os 5 prêmios.");
    }

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios: premios.slice(0, 5),
      },
    });
  } catch (err) {
    console.error("Erro scraping Caixa:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao consultar os resultados da Caixa.",
    });
  }
});

export default router;