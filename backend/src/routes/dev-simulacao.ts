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

/**
 * ============================
 * SIMULAÇÃO SIMPLES
 * ============================
 */
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
  } catch {
    return res.status(500).json({ erro: "Erro na simulação" });
  }
});

/**
 * ============================
 * 🔥 SIMULAÇÃO EM MASSA
 * ============================
 */
router.post("/simulacao-massa", (req, res) => {
  try {
    const { rodadas = 1000, bilhetesPorRodada = 100, premio = 500 } = req.body;

    let totalGanhadores = 0;
    let rodadasComGanhador = 0;
    let totalPago = 0;

    for (let i = 0; i < rodadas; i++) {
      // gera 5 números aleatórios (simulando Federal)
      const resultados = Array.from({ length: 5 }, () =>
        String(Math.floor(Math.random() * 100000)).padStart(5, "0")
      );

      const dezenasSorteadas = extrairDezenas(resultados);

      let ganhadoresRodada = 0;

      for (let j = 0; j < bilhetesPorRodada; j++) {
        const bilhete = Array.from({ length: 3 }, () =>
          normalizarDezena(String(Math.floor(Math.random() * 100)))
        );

        const acertos = bilhete.filter((d) =>
          dezenasSorteadas.includes(d)
        ).length;

        if (acertos === 3) {
          ganhadoresRodada++;
        }
      }

      if (ganhadoresRodada > 0) {
        rodadasComGanhador++;
        totalGanhadores += ganhadoresRodada;
        totalPago += premio;
      }
    }

    return res.json({
      rodadas,
      bilhetesPorRodada,
      rodadasComGanhador,
      percentualRodadasComGanhador: (
        (rodadasComGanhador / rodadas) *
        100
      ).toFixed(2) + "%",
      mediaGanhadoresPorRodada: (
        totalGanhadores / rodadas
      ).toFixed(2),
      totalPago,
    });
  } catch {
    return res.status(500).json({ erro: "Erro na simulação em massa" });
  }
});

export default router;