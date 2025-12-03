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

    // ================================
    // NOVO SISTEMA DE EXTRAÇÃO DE PRÊMIOS
    // ================================
    let premios: string[] = [];

    // 1) Tenta extrair padrão mais comum
    const regex1 = /<td[^>]*>\s*\d{1}\s*<\/td>\s*<td[^>]*>\s*(\d{5})\s*<\/td>/g;
    let m;
    while ((m = regex1.exec(html)) !== null) premios.push(m[1]);

    // 2) Se não achou 5 números, tenta outro formato
    if (premios.length < 5) {
      const regex2 = /\dº prêmio[^0-9]*(\d{5})/gi;
      let x;
      while ((x = regex2.exec(html)) !== null) premios.push(x[1]);
    }

    // 3) Última alternativa: busca qualquer número de 5 dígitos dentro da área de resultado
    if (premios.length < 5) {
      const regex3 = /(\d{5})/g;
      const bruto = [...html.matchAll(regex3)].map((m) => m[1]);

      // filtrando repetições irrelevantes
      const candidatos = bruto.filter(
        (num) => !["2025", "2024", "2023"].includes(num) // evita datas
      );

      // pegar os primeiros 5 que fazem sentido
      premios = candidatos.slice(0, 5);
    }

    if (premios.length < 5) {
      throw new Error("Não foi possível extrair os números premiados.");
    }

    return res.json({
      ok: true,
      data: {
        concurso,
        dataApuracao,
        premios,
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