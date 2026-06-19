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

function obterIntervaloDiaSaoPaulo(data: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";

  const dataLocal = `${valor("year")}-${valor("month")}-${valor("day")}`;

  return {
    inicio: new Date(`${dataLocal}T00:00:00-03:00`),
    fim: new Date(`${dataLocal}T23:59:59.999-03:00`),
  };
}

/**
 * Busca resultado oficial da Federal
 */
async function buscarResultadoFederal(): Promise<{
  dataApuracao: Date;
  numeros: string[];
} | null> {
  try {
    const resp = await fetch(
      `${
        process.env.BACKEND_URL ||
        `http://127.0.0.1:${process.env.PORT || 4000}`
      }/federal`
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
    const federal = await buscarResultadoFederal();

    if (!federal) {
      console.log("ℹ️ [ZLPix-Premiado] Sem resultado da Federal para sorteio automático.");
      return;
    }

    while (true) {
      const { inicio: inicioFederal, fim: fimFederal } =
        obterIntervaloDiaSaoPaulo(federal.dataApuracao);

      const bilhetePendente = await prisma.bilhete.findFirst({
        where: {
          pago: true,
          status: "ATIVO",
          apuradoEm: null,
          sorteioData: {
            gte: inicioFederal,
            lte: fimFederal,
          },
          OR: [
            { resultadoFederal: null },
            { resultadoFederal: { startsWith: "PROCESSANDO_" } },
          ],
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

      // Converte cada milhar da Federal em duas dezenas de 2 dígitos.
      const dezenas: string[] = [];

      for (const num of federal.numeros) {
        const clean = String(num || "").replace(/\D/g, "");

        if (clean.length < 4) continue;

        const milhar = clean.slice(-4);

        dezenas.push(milhar.slice(0, 2));
        dezenas.push(milhar.slice(2, 4));
      }

      const resultado = await processarSorteio(
        bilhetePendente.sorteioData,
        {
          dezenas,
        }
      );

      if (!resultado.ok) {
        break;
      }

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

// Bootstrap
setTimeout(() => {
  void processarSorteiosPendentesAutomatico();
}, 15_000);

// Cron
cron.schedule("*/5 * * * *", async () => {
  await processarSorteiosPendentesAutomatico();
});