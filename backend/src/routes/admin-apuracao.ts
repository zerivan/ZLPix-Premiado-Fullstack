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
 * ADMIN — APURAR SORTEIO
 * =====================================================
 * - cruza Federal x Bilhetes
 * - define ganhadores
 * - calcula prêmio
 * - acumula ou reseta
 */
router.post("/apurar", async (req, res) => {
  try {
    const { premiosFederal } = req.body; // array string[] ex: ["32456","98765",...]

    if (!Array.isArray(premiosFederal) || premiosFederal.length < 1) {
      return res.status(400).json({ error: "Resultado da Federal inválido." });
    }

    const dezenasPremiadas = new Set<string>();

    // pega dezenas iniciais e finais das centenas
    premiosFederal.forEach((num) => {
      dezenasPremiadas.add(num.slice(0, 2));
      dezenasPremiadas.add(num.slice(-2));
    });

    // bilhetes ativos do sorteio atual
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO",
        sorteioData: {
          lte: proximaQuarta(),
        },
      },
    });

    let ganhadores: typeof bilhetes = [];

    for (const b of bilhetes) {
      const dezenas = b.dezenas.split(",");

      const ganhou = dezenas.some((d) => dezenasPremiadas.has(d));

      if (ganhou) {
        ganhadores.push(b);
      }
    }

    // buscar prêmio atual salvo (usa AppContent)
    const premioAtualRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    let premioAtual = premioAtualRow
      ? Number(premioAtualRow.contentHtml)
      : PREMIO_BASE;

    if (ganhadores.length === 0) {
      // 🔁 ACUMULA
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

    // 💰 HOUVE GANHADORES
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

    // 🔄 RESETAR PRÊMIO
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