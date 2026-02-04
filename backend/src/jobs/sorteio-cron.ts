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
      console.log(
        "ℹ️ [ZLPix-Premiado] Nenhum resultado oficial disponível."
      );
      return;
    }

    const { dataApuracao, numeros } = federal;

    // 🔥 REGRA DO APP: somente quarta-feira
    const diaSemana = dataApuracao.getDay(); // 0=dom, 3=qua
    if (diaSemana !== 3) {
      console.log("⛔ Resultado ignorado: não é quarta-feira.");
      return;
    }

    // 🔥 REGRA DO APP: somente após 20h
    const agora = new Date();
    if (agora.getHours() < 20) {
      console.log("⏳ Aguardando 20h para validar sorteio.");
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