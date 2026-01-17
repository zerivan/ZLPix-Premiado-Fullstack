import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

/**
 * ============================================
 * ⏰ CRON AUTOMÁTICO DE SORTEIO
 * ============================================
 * - Executa sorteios vencidos
 * - Roda em background
 * - Nunca duplica sorteio
 */

async function buscarResultadoFake(): Promise<string[]> {
  // ⚠️ MODO TESTE CONTROLADO
  return ["12", "45", "98"];
}

cron.schedule("*/10 * * * *", async () => {
  try {
    const agora = new Date();

    // 🔍 Busca UM sorteio vencido ainda ATIVO
    const bilhete = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
    });

    if (!bilhete) return;

    const sorteioData = bilhete.sorteioData;

    console.log("⏳ Sorteio automático:", sorteioData);

    // 🔢 Resultado fake (teste)
    const dezenas = await buscarResultadoFake();

    // 💰 Soma do prêmio
    const premioAgg = await prisma.bilhete.aggregate({
      where: {
        status: "ATIVO",
        sorteioData,
      },
      _sum: {
        valor: true,
      },
    });

    const premioTotal = Number(premioAgg._sum.valor || 0);

    if (premioTotal <= 0) {
      console.log("⚠️ Sorteio sem prêmio válido");
      return;
    }

    await processarSorteio(sorteioData, {
      dezenas,
      premioTotal,
    });

    console.log("✅ Sorteio finalizado:", sorteioData);
  } catch (err) {
    console.error("❌ Erro no cron de sorteio:", err);
  }
});