import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    // Buscar o HTML direto do site da Caixa
    const response = await fetch(
      "https://loterias.caixa.gov.br/Paginas/Federal.aspx"
    );
    const html = await response.text();

    // Extrair o número do concurso
    const concursoMatch = html.match(/Concurso nº<\/span>\s*([\d]+)/);
    const concurso = concursoMatch ? concursoMatch[1] : "N/A";

    // Extrair a data do sorteio
    const dataMatch = html.match(/data do sorteio:\s*<\/span>\s*([^<]+)/i);
    const dataApuracao = dataMatch ? dataMatch[1].trim() : "N/A";

    // Extrair os números premiados (5 linhas)
    const regexPremios =
      /<td class="w-25">([\d]+)<\/td>\s*<td class="w-75">([\d]+)/g;

    const premios: string[] = [];
    let m;

    while ((m = regexPremios.exec(html)) !== null) {
      // m[2] é o número premiado
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
        premios: premios.slice(0, 5), // garante só os 5 primeiros
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