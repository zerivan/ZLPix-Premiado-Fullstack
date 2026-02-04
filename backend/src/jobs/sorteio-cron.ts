// backend/src/jobs/sorteio-cron.ts
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

/**
 * =====================================================
 * CRON — APURAÇÃO BASEADA EM DATA OFICIAL DA FEDERAL
 * =====================================================
 */
cron.schedule("*/10 * * * *", async () => {
  try {
    const federal = await buscarResultadoFederal();

    if (!federal) {
      console.log("ℹ️ [ZLPix-Premiado] Nenhum resultado oficial disponível.");
      return;
    }

    const { dataApuracao, numeros } = federal;

    /**
     * 🔥 AJUSTE PARA HORÁRIO DO BRASIL (UTC-3)
     */
    const agoraUtc = new Date();
    const agoraBrasil = new Date(agoraUtc.getTime() - 3 * 60 * 60 * 1000);

    const hojeBrasil = new Date(agoraBrasil);
    hojeBrasil.setHours(0, 0, 0, 0);

    const dataFederalBrasil = new Date(dataApuracao);
    dataFederalBrasil.setHours(0, 0, 0, 0);

    /**
     * 🔥 REGRA 1: Só processa se for quarta-feira
     */
    if (dataFederalBrasil.getDay() !== 3) {
      console.log("⛔ Resultado ignorado: não é quarta-feira.");
      return;
    }

    /**
     * 🔥 REGRA 2: Só processa se a data da Federal for HOJE (Brasil)
     */
    if (dataFederalBrasil.getTime() !== hojeBrasil.getTime()) {
      console.log("⛔ Resultado ignorado: não é a quarta-feira atual.");
      return;
    }

    /**
     * 🔥 REGRA 3: Só após 20h horário Brasil
     */
    if (agoraBrasil.getHours() < 20) {
      console.log("⏳ Aguardando 20h (horário Brasil) para validar sorteio.");
      return;
    }

    const inicio = new Date(dataApuracao);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dataApuracao);
    fim.setHours(23, 59, 59, 999);

    const bilhetePendente = await prisma.bilhete.findFirst({
      where: {
        status: "ATIVO",
        apuradoEm: null,
        sorteioData: {
          gte: inicio,
          lte: fim,
        },
      },
    });

    if (!bilhetePendente) {
      return;
    }

    console.log("⏳ Processando sorteio oficial:", dataApuracao);

    await processarSorteio(dataApuracao, {
      dezenas: numeros,
    });

    console.log("✅ Sorteio processado com base na Federal:", dataApuracao);
  } catch (err) {
    console.error("❌ Erro no cron de sorteio:", err);
  }
});