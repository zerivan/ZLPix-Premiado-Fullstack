// backend/src/jobs/sorteio-cron.ts
import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

type FederalResponse = {
  ok: boolean;
  data?: {
    premios: string[]; // 1º ao 5º prêmio (milhar)
  };
};

/**
 * ============================================
 * ⏰ CRON AUTOMÁTICO DE SORTEIO (OFICIAL)
 * ============================================
 * - Executa sorteios vencidos
 * - Busca resultado REAL da Federal
 * - Usa Federal como única fonte de verdade
 * - Prêmio é controlado pelo CMS (premio_atual)
 */

async function buscarResultadoFederal(): Promise<string[] | null> {
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
    );

    const json = (await resp.json()) as FederalResponse;

    if (!json.ok || !Array.isArray(json.data?.premios)) return null;
    if (json.data.premios.length !== 5) return null;

    const dezenas: string[] = [];

    for (const num of json.data.premios) {
      dezenas.push(num.slice(0, 2)); // frente
      dezenas.push(num.slice(-2));  // fundo
    }

    return dezenas;
  } catch {
    return null;
  }
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

    console.log("⏳ Sorteio automático (Federal):", sorteioData);

    // 🔢 Resultado REAL da Federal
    const dezenas = await buscarResultadoFederal();

    if (!dezenas || dezenas.length !== 10) {
      console.log("⚠️ Resultado da Federal indisponível ou inválido");
      return;
    }

    // ✅ PROCESSA SORTEIO
    // 💰 Prêmio é obtido INTERNAMENTE via CMS (premio_atual)
    await processarSorteio(sorteioData, { dezenas });

    console.log("✅ Sorteio Federal processado:", sorteioData);
  } catch (err) {
    console.error("❌ Erro no cron de sorteio:", err);
  }
});