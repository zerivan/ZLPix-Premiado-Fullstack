import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * CONFIGURAÇÃO DO PRÊMIO
 * =====================================================
 */
const PREMIO_BASE = 500;

/**
 * Próxima quarta-feira às 20h
 */
function proximaQuarta(): Date {
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
 * API — PRÊMIO ATUAL (HOME / APP)
 * =====================================================
 */
router.get("/premio-atual", async (_req, res) => {
  try {
    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    const premioAtual = premioRow
      ? Number(premioRow.contentHtml)
      : PREMIO_BASE;

    const proximoSorteio = proximaQuarta();

    return res.json({
      ok: true,
      data: {
        premioAtual,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime(),
      },
    });
  } catch (error) {
    console.error("Erro prêmio atual:", error);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * ADMIN — APURAR SORTEIO
 * =====================================================
 */
router.post("/apurar", async (req, res) => {
  try {
    const { premiosFederal } = req.body; // string[]

    if (!Array.isArray(premiosFederal) || premiosFederal.length !== 5) {
      return res.status(400).json({ error: "Resultado da Federal inválido." });
    }

    /**
     * 🎯 DEZENAS PREMIADAS (FRENTE + FUNDO)
     */
    const dezenasPremiadas: string[] = [];

    premiosFederal.forEach((num) => {
      dezenasPremiadas.push(num.slice(0, 2)); // frente
      dezenasPremiadas.push(num.slice(-2));  // fundo
    });

    /**
     * 🎟️ SOMENTE BILHETES DO SORTEIO ATUAL
     */
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO_ATUAL",
      },
    });

    /**
     * 🏆 GANHADORES = ACERTAR 3 DEZENAS
     */
    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas.split(",");
      const acertos = dezenasBilhete.filter((d) =>
        dezenasPremiadas.includes(d)
      );
      return acertos.length >= 3;
    });

    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    let premioAtual = premioRow
      ? Number(premioRow.contentHtml)
      : PREMIO_BASE;

    /**
     * 🔁 SEM GANHADORES → ACUMULA
     */
    if (ganhadores.length === 0) {
      premioAtual += PREMIO_BASE;

      await prisma.appContent.upsert({
        where: { key: "premio_atual" },
        update: { contentHtml: String(premioAtual) },
        create: {
          key: "premio_atual",
          title: "Prêmio Atual",
          contentHtml: String(premioAtual),
        },
      });

      return res.json({
        ok: true,
        mensagem: "Nenhum ganhador. Prêmio acumulado.",
        premioAtual,
      });
    }

    /**
     * 💰 COM GANHADORES → DIVIDE
     */
    const valorPorBilhete = premioAtual / ganhadores.length;

    for (const b of ganhadores) {
      await prisma.bilhete.update({
        where: { id: b.id },
        data: {
          status: "PREMIADO",
          premioValor: valorPorBilhete,
          resultadoFederal: premiosFederal.join(","),
          apuradoEm: new Date(),
        },
      });
    }

    /**
     * 🔄 RESETAR PRÊMIO
     */
    await prisma.appContent.upsert({
      where: { key: "premio_atual" },
      update: { contentHtml: String(PREMIO_BASE) },
      create: {
        key: "premio_atual",
        title: "Prêmio Atual",
        contentHtml: String(PREMIO_BASE),
      },
    });

    return res.json({
      ok: true,
      ganhadores: ganhadores.length,
      valorPorBilhete,
      proximoPremio: PREMIO_BASE,
    });
  } catch (error) {
    console.error("Erro apuração:", error);
    return res.status(500).json({ error: "Erro ao apurar sorteio." });
  }
});

export default router;