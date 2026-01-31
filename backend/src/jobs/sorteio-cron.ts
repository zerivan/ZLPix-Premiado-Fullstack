// backend/src/jobs/sorteio-cron.ts
import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { processarSorteio } from "../services/sorteio-processor";

type FederalResponse = {
  ok: boolean;
  data?: {
    dataApuracao?: string | null;
    premios: string[]; // 1º ao 5º prêmio (número completo)
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
 * Regra correta:
 * - NÃO depende de horário (17h não interfere)
 * - NÃO depende apenas de bilhete vencido
 * - Só processa quando existir resultado oficial
 * - Só processa se ainda houver bilhete ATIVO não apurado
 */
cron.schedule("*/10 * * * *", async () => {
  try {
    const federal = await buscarResultadoFederal();

    if (!federal) {
  console.log(
    "ℹ️ [ZLPix-Premiado] Sorteio não realizado: Nenhum resultado oficial disponível para esta data OU não há bilhete ativo para apuração. Essa mensagem pode aparecer em apurações manuais quando o sorteio da Federal ainda não foi publicado, ou se já foi processado anteriormente."
  );
  return;
}

    const { dataApuracao, numeros } = federal;

    const inicio = new Date(dataApuracao);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dataApuracao);
    fim.setHours(23, 59, 59, 999);

    // 🔎 Verifica se ainda existe bilhete ATIVO não apurado
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
      dezenas: numeros, // números completos, motor extrai milhar
    });

    console.log("✅ Sorteio processado com base na Federal:", dataApuracao);
  } catch (err) {
    console.error("❌ Erro no cron de sorteio:", err);
  }
});