import { Router } from "express";

const router = Router();

function normalizarDezena(valor: string): string {
  return valor.trim().padStart(2, "0");
}

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

router.post("/simulacao-sorteio", (req, res) => {
  try {
    const { resultados, bilhetes, premio } = req.body;

    if (!Array.isArray(resultados) || resultados.length !== 5) {
      return res.status(400).json({ erro: "Envie 5 resultados" });
    }

    if (!Array.isArray(bilhetes)) {
      return res.status(400).json({ erro: "Bilhetes inválidos" });
    }

    const premioTotal = Number(premio || 500);

    const dezenasSorteadas = extrairDezenas(resultados);

    const resultadoBilhetes = bilhetes.map((b: string) => {
      const dezenasBilhete = b
        .split(",")
        .map(normalizarDezena)
        .filter(Boolean);

      const acertos = dezenasBilhete.filter((d) =>
        dezenasSorteadas.includes(d)
      ).length;

      return {
        bilhete: dezenasBilhete,
        acertos,
        ganhou: acertos === 3,
      };
    });

    const ganhadores = resultadoBilhetes.filter((b) => b.ganhou);

    let valorPorGanhador = 0;

    if (ganhadores.length > 0) {
      valorPorGanhador = Number(
        (premioTotal / ganhadores.length).toFixed(2)
      );
    }

    return res.json({
      dezenasSorteadas,
      totalDezenas: dezenasSorteadas.length,
      premioTotal,
      ganhadores: ganhadores.length,
      valorPorGanhador,
      resultadoBilhetes,
    });
  } catch (error) {
    return res.status(500).json({
      erro: "Erro na simulação",
    });
  }
});

export default router;