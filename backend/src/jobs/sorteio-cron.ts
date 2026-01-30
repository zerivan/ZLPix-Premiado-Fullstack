// backend/src/jobs/sorteio-cron.ts
import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

type FederalResponse = {
  ok: boolean;
  data?: {
    premios: string[]; // 1º ao 5º prêmio (número completo)
  };
};

async function buscarResultadoFederal(): Promise<string[] | null> {
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
    );

    const json = (await resp.json()) as FederalResponse;

    if (!json.ok || !Array.isArray(json.data?.premios)) return null;
    if (json.data.premios.length !== 5) return null;

    // ✅ Retorna números completos
    return json.data.premios;
  } catch {
    return null;
  }
}

cron.schedule("*/10 * * * *", async () => {
  try {
    const agora = new Date();

    const bilhete = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        sorteioData: { lte: agora },
      },
    });

    if (!bilhete) return;

    const sorteioData = bilhete.sorteioData;

    console.log("⏳ Sorteio automático (Federal):", sorteioData);

    const numerosCompletos = await buscarResultadoFederal();

    if (!numerosCompletos) {
      console.log("⚠️ Resultado da Federal indisponível ou inválido");
      return;
    }

    // ✅ Motor agora extrai milhar internamente
    await processarSorteio(sorteioData, { dezenas: numerosCompletos });

    console.log("✅ Sorteio Federal processado:", sorteioData);
  } catch (err) {
    console.error("❌ Erro no cron de sorteio:", err);
  }
});