import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

type FederalResponse = {
  ok: boolean;
  data?: {
    dataApuracao?: string | null;
    premios: string[];
  };
};

let emExecucao = false;

/**
 * Busca resultado oficial da Federal
 */
async function buscarResultadoFederal(): Promise<{
  dataApuracao: Date;
  numeros: string[];
} | null> {
  try {
    const resp = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
    );

    const json = (await resp.json()) as FederalResponse;

    if (!json.ok) return null;
    if (!json.data?.dataApuracao) return null;
    if (!Array.isArray(json.data?.premios)) return null;
    if (json.data.premios.length !== 5) return null;

    const dataApuracao = new Date(json.data.dataApuracao);
    if (isNaN(dataApuracao.getTime())) return null;

    return {
      dataApuracao,
      numeros: json.data.premios,
    };
  } catch {
    return null;
  }
}

async function processarSorteiosPendentesAutomatico() {
  if (emExecucao) return;
  emExecucao = true;

  try {
    // 🔥 CORREÇÃO: buscar federal uma vez só
    const federal = await buscarResultadoFederal();

    if (!federal) {
      console.log("ℹ️ [ZLPix-Premiado] Sem resultado da Federal para sorteio automático.");
      return;
    }

    while (true) {
      const bilhetePendente = await prisma.bilhete.findFirst({
        where: {
          pago: true,
          status: "ATIVO",
          apuradoEm: null,
          OR: [
            { resultadoFederal: null },
            { resultadoFederal: { startsWith: "PROCESSANDO_" } },
          ],
          // ✅ CORREÇÃO: removido filtro por "agora"
          // deixa o processor decidir o recorte de data
        },
        orderBy: {
          sorteioData: "asc",
        },
        select: {
          sorteioData: true,
        },
      });

      if (!bilhetePendente) {
        break;
      }

      console.log(
        "⏳ [ZLPix-Premiado] Processando sorteio automático:",
        bilhetePendente.sorteioData.toISOString()
      );

      await processarSorteio(bilhetePendente.sorteioData, {
        dezenas: federal.numeros,
      });

      console.log(
        "✅ [ZLPix-Premiado] Sorteio automático concluído:",
        bilhetePendente.sorteioData.toISOString()
      );
    }
  } catch (err) {
    console.error("❌ Erro no processamento automático de sorteio:", err);
  } finally {
    emExecucao = false;
  }
}

// Bootstrap: garante tentativa imediata ao subir o servidor
setTimeout(() => {
  void processarSorteiosPendentesAutomatico();
}, 15_000);

// Execução leve recorrente
cron.schedule("*/5 * * * *", async () => {
  await processarSorteiosPendentesAutomatico();
});