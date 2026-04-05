import { Router } from "express";

const router = Router();

/**
 * NORMALIZA DEZENA
 */
function normalizarDezena(valor: string): string {
  return valor.trim().padStart(2, "0");
}

/**
 * EXTRAÇÃO BASEADA NA MILHAR (REGRA OFICIAL DO SISTEMA)
 * - pega os últimos 4 dígitos
 * - gera 2 dezenas:
 *   - início (2 primeiros da milhar)
 *   - fim (2 últimos da milhar)
 */
function extrairDezenas(resultado: string[]): string[] {
  return Array.from(
    new Set(
      resultado.flatMap((numeroCompleto) => {
        const numero = numeroCompleto.replace(/\D/g, "").padStart(5, "0");

        const milhar = numero.slice(-4);

        const inicio = normalizarDezena(milhar.slice(0, 2));
        const fim = normalizarDezena(milhar.slice(2, 4));

        return [inicio, fim];
      })
    )
  );
}

/**
 * SIMULAÇÃO
 */
router.post("/simulacao-sorteio", (req, res) => {
  try {
    const { resultados, bilhetes } = req.body;

    if (!Array.isArray(resultados) || resultados.length !== 5) {
      return res.status(400).json({
        erro: "Envie exatamente 5 resultados",
      });
    }

    if (!Array.isArray(bilhetes)) {
      return res.status(400).json({
        erro: "Bilhetes inválidos",
      });
    }

    const dezenasSorteadas = extrairDezenas(resultados);

    const resultadoBilhetes = bilhetes.map((b: string) => {
      const dezenasBilhete = b
        .split(",")
        .map((d) => normalizarDezena(d))
        .filter(Boolean);

      const acertos = dezenasBilhete.filter((d) =>
        dezenasSorteadas.includes(d)
      ).length;

      return {
        bilhete: dezenasBilhete,
        acertos,
        ganhou: acertos === 3, // regra 3/3
      };
    });

    return res.json({
      dezenasSorteadas,
      totalDezenas: dezenasSorteadas.length,
      resultadoBilhetes,
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Erro na simulação",
      detalhe: error instanceof Error ? error.message : error,
    });
  }
});

export default router;