import { prisma } from "../lib/prisma";
import crypto from "crypto";

type ResultadoOficial = {
  dezenas: string[];
};

const PREMIO_INICIAL = 500;
const PREMIO_ATUAL_KEY = "premio_atual_ciclo";

async function obterPremioAtualPersistido(
  db: any = prisma
): Promise<number> {
  const row = await db.appContent.findUnique({
    where: {
      key: PREMIO_ATUAL_KEY,
    },
  });

  const valor = Number(
    row?.contentHtml ?? PREMIO_INICIAL
  );

  if (!Number.isFinite(valor) || valor < 0) {
    return PREMIO_INICIAL;
  }

  return Number(valor.toFixed(2));
}

function normalizarDezena(valor: string): string {
  return valor.trim().padStart(2, "0");
}

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

function extrairDezenasValidas(
  numeroCompleto: string
): string[] {
  const numero = String(
    numeroCompleto || ""
  ).replace(/\D/g, "");

  if (!numero) return [];

  if (numero.length <= 2) {
    return [
      normalizarDezena(numero),
    ];
  }

  const milhar = numero
    .padStart(5, "0")
    .slice(-4);

  return [
    normalizarDezena(milhar.slice(0, 2)),
    normalizarDezena(milhar.slice(2, 4)),
  ];
}

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  const { inicio, fim } = obterIntervaloDiaSaoPaulo(sorteioData);

  const claimToken =
    `PROCESSANDO_${new Date().toISOString()}_${crypto.randomUUID()}`;

  const limiteTravamento =
    Date.now() - 30 * 60 * 1000;

  const possivelmenteTravados =
    await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO",
        apuradoEm: null,
        resultadoFederal: {
          startsWith: "PROCESSANDO_",
        },
        sorteioData: {
          gte: inicio,
          lte: fim,
        },
      },
      select: {
        id: true,
        resultadoFederal: true,
      },
    });

  const idsTravados = possivelmenteTravados
    .filter((bilhete) => {
      const timestamp =
        bilhete.resultadoFederal?.split("_")[1];

      const processandoDesde = timestamp
        ? new Date(timestamp).getTime()
        : NaN;

      return (
        !Number.isFinite(processandoDesde) ||
        processandoDesde < limiteTravamento
      );
    })
    .map((bilhete) => bilhete.id);

  if (idsTravados.length) {
    await prisma.bilhete.updateMany({
      where: {
        id: {
          in: idsTravados,
        },
        resultadoFederal: {
          startsWith: "PROCESSANDO_",
        },
      },
      data: {
        resultadoFederal: null,
      },
    });
  }

  const claim = await prisma.bilhete.updateMany({
    where: {
      pago: true,
      status: "ATIVO",
      apuradoEm: null,
      resultadoFederal: null,
      sorteioData: {
        gte: inicio,
        lte: fim,
      },
    },
    data: {
      resultadoFederal: claimToken,
    },
  });

  if (claim.count === 0) {
    return {
      ok: false,
      message: "Nenhum bilhete no sorteio",
    };
  }

  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        resultadoFederal: claimToken,
        sorteioData: {
          gte: inicio,
          lte: fim,
        },
      },
    });

    if (!bilhetes.length) {
      return {
        ok: false,
        message: "Nenhum bilhete no sorteio",
      };
    }

    const dezenasValidas = Array.from(
      new Set(
        resultado.dezenas.flatMap((numero) =>
          extrairDezenasValidas(numero)
        )
      )
    );

    const resultadoStr = resultado.dezenas
      .map((numero) =>
        String(numero || "").replace(/\D/g, "")
      )
      .filter(Boolean)
      .join(",");

    const agora = new Date();

    const ganhadores = bilhetes.filter((bilhete) => {
      const dezenasBilhete = bilhete.dezenas
        .split(",")
        .map((dezena) =>
          normalizarDezena(dezena)
        )
        .filter(Boolean);

      return (
        dezenasBilhete.length === 3 &&
        dezenasBilhete.every((dezena) =>
          dezenasValidas.includes(dezena)
        )
      );
    });

    await prisma.$transaction(async (tx) => {
      const premioAtual =
        await obterPremioAtualPersistido(tx);

      // Usa apenas o lote atual identificado pelo claimToken.
      const bilhetesDaRodada =
        await tx.bilhete.findMany({
          where: {
            resultadoFederal: claimToken,
          },
          select: {
            valor: true,
          },
        });

      const arrecadacaoDaRodada = Number(
        bilhetesDaRodada
          .reduce(
            (acc, bilhete) =>
              acc + (Number(bilhete.valor) || 0),
            0
          )
          .toFixed(2)
      );

      if (!ganhadores.length) {
        await tx.bilhete.updateMany({
          where: {
            resultadoFederal: claimToken,
          },
          data: {
            status: "NAO_PREMIADO",
            resultadoFederal: resultadoStr,
            apuradoEm: agora,
          },
        });

        const novoPremio = Number(
          (
            premioAtual +
            arrecadacaoDaRodada * 0.3
          ).toFixed(2)
        );

        await persistirPremioAtual(
          tx,
          novoPremio
        );

        return;
      }

      const premioEmCentavos =
        Math.round(premioAtual * 100);

      const valorBaseEmCentavos = Math.floor(
        premioEmCentavos / ganhadores.length
      );

      const centavosRestantes =
        premioEmCentavos % ganhadores.length;

      for (
        const [indice, bilhete]
        of ganhadores.entries()
      ) {
        const valorPorGanhador =
          (
            valorBaseEmCentavos +
            (indice < centavosRestantes ? 1 : 0)
          ) / 100;

        await tx.wallet.upsert({
          where: {
            userId: bilhete.userId,
          },
          update: {},
          create: {
            userId: bilhete.userId,
            saldo: 0,
            createdAt: new Date(),
          },
        });

        await tx.wallet.updateMany({
          where: {
            userId: bilhete.userId,
          },
          data: {
            saldo: {
              increment: valorPorGanhador,
            },
          },
        });

        await tx.transacao_carteira.create({
          data: {
            userId: bilhete.userId,
            valor: valorPorGanhador,
            tipo: "PREMIO",
            status: "paid",
            metadata: {
              bilheteId: bilhete.id,
              sorteioData: inicio.toISOString(),
            },
          },
        });

        await tx.bilhete.update({
          where: {
            id: bilhete.id,
          },
          data: {
            status: "PREMIADO",
            premioValor: valorPorGanhador,
            resultadoFederal: resultadoStr,
            apuradoEm: agora,
          },
        });
      }

      await tx.bilhete.updateMany({
        where: {
          resultadoFederal: claimToken,
          status: "ATIVO",
        },
        data: {
          status: "NAO_PREMIADO",
          resultadoFederal: resultadoStr,
          apuradoEm: agora,
        },
      });

      await persistirPremioAtual(
        tx,
        PREMIO_INICIAL
      );
    });

    return {
      ok: true,
      ganhadores: ganhadores.length,
    };
  } catch (error) {
    await prisma.bilhete.updateMany({
      where: {
        resultadoFederal: claimToken,
        apuradoEm: null,
      },
      data: {
        resultadoFederal: null,
      },
    });

    throw error;
  }
}

async function persistirPremioAtual(
  db: any,
  valor: number
) {
  await db.appContent.upsert({
    where: {
      key: PREMIO_ATUAL_KEY,
    },
    update: {
      contentHtml: String(valor),
      title: "Prêmio Atual do Ciclo",
      type: "config",
      enabled: true,
      isActive: true,
    },
    create: {
      key: PREMIO_ATUAL_KEY,
      slug: PREMIO_ATUAL_KEY,
      title: "Prêmio Atual do Ciclo",
      type: "config",
      contentHtml: String(valor),
      enabled: true,
      isActive: true,
    },
  });
}