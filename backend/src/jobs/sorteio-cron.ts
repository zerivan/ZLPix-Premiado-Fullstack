import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

/**
 * ============================================
 * ⏰ CRON AUTOMÁTICO DE SORTEIO
 * ============================================
 * - Roda automaticamente
 * - Não depende de admin
 * - Executa sorteio apenas UMA vez
 */

async function buscarResultadoFederal(): Promise<string[]> {
  /**
   * ⚠️ SIMULAÇÃO CONTROLADA
   * Aqui futuramente entra:
   * - API da Loteria Federal
   * - ou inserção manual no admin
   */
  return ["12", "45", "98"]; // placeholder seguro
}

cron.schedule("*/10 * * * *", async () => {
  try {
    const agora = new Date();

    // 🔍 Busca sorteios ATIVOS que já passaram da data
    const bilhetesPendentes = await prisma.bilhete.findMany({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
      take: 1,
    });

    if (!bilhetesPendentes.length) {
      return;
    }

    const sorteioData = bilhetesPendentes[0].sorteioData;

    console.log("⏳ Executando sorteio automático:", sorteioData);

    const dezenas = await buscarResultadoFederal();

    const premioTotal = await prisma.bilhete.aggregate({
      where: {
        status: "ATIVO",
        sorteioData,
      },
      _sum: {
        valor: true,
      },
    });

    await processarSorteio(sorteioData, {
      dezenas,
      premioTotal: Number(premioTotal._sum.valor || 0),
    });

    console.log("✅ Sorteio automático finalizado com sucesso");
  } catch (err) {
    console.error("❌ Erro no CRON de sorteio:", err);
  }
});