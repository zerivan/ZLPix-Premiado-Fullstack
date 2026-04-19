import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
};

const PREMIO_INICIAL = 500;
const PREMIO_ATUAL_KEY = "premio_atual_ciclo";

async function obterPremioAtualPersistido(): Promise<number> {
  const row = await prisma.appContent.findUnique({
    where: { key: PREMIO_ATUAL_KEY },
  });

  const valor = Number(row?.contentHtml ?? PREMIO_INICIAL);

  if (!Number.isFinite(valor) || valor < 0) {
    return PREMIO_INICIAL;
  }

  return Number(valor.toFixed(2));
}

async function persistirPremioAtual(valor: number): Promise<void> {
  const valorNormalizado = Number((Number(valor) || PREMIO_INICIAL).toFixed(2));

  await prisma.appContent.upsert({
    where: { key: PREMIO_ATUAL_KEY },
    update: {
      contentHtml: String(valorNormalizado),
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
      contentHtml: String(valorNormalizado),
      enabled: true,
      isActive: true,
    },
  });
}

async function obterArrecadacaoDaRodada(inicio: Date, fim: Date): Promise<number> {
  const bilhetesDaRodada = await prisma.bilhete.findMany({
    where: {
      pago: true,
      status: "ATIVO",
      apuradoEm: null,
      sorteioData: { gte: inicio, lte: fim },
    },
    select: {
      valor: true,
    },
  });

  const arrecadacao = bilhetesDaRodada.reduce((acc, b) => {
    return acc + (Number(b.valor) || 0);
  }, 0);

  return Number(arrecadacao.toFixed(2));
}

async function garantirCarteira(userId: number) {
  await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      saldo: 0,
      createdAt: new Date(),
    },
  });
}

function normalizarDezena(valor: string): string {
  return valor.trim().padStart(2, "0");
}

function extrairDezenasValidas(numeroCompleto: string): string[] {
  const numero = String(numeroCompleto || "").replace(/\D/g, "");

  if (!numero) return [];

  if (numero.length <= 2) {
    return [normalizarDezena(numero)];
  }

  const milhar = numero.padStart(5, "0").slice(-4);

  return [
    normalizarDezena(milhar.slice(0, 2)),
    normalizarDezena(milhar.slice(2, 4)),
  ];
}

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  const inicio = new Date(sorteioData);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(sorteioData);
  fim.setHours(23, 59, 59, 999);

  const claimToken = `PROCESSANDO_${inicio.toISOString()}`;

  const claim = await prisma.bilhete.updateMany({
    where: {
      pago: true,
      status: "ATIVO",
      apuradoEm: null,
      resultadoFederal: null,
      sorteioData: { gte: inicio, lte: fim },
    },
    data: {
      resultadoFederal: claimToken,
    },
  });

  if (claim.count === 0) {
    return { ok: false, message: "Nenhum bilhete no sorteio" };
  }

  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        resultadoFederal: claimToken,
        sorteioData: { gte: inicio, lte: fim },
      },
    });

    if (!bilhetes.length) {
      return { ok: false, message: "Nenhum bilhete no sorteio" };
    }

    const dezenasValidas = Array.from(
      new Set(resultado.dezenas.flatMap((numero) => extrairDezenasValidas(numero)))
    );

    const resultadoStr = resultado.dezenas
      .map((n) => String(n || "").replace(/\D/g, ""))
      .filter(Boolean)
      .join(",");

    const agora = new Date();
    const premioAtual = await obterPremioAtualPersistido();
    const arrecadacaoDaRodada = await obterArrecadacaoDaRodada(inicio, fim);

    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas
        .split(",")
        .map((d) => normalizarDezena(d))
        .filter(Boolean);

      return (
        dezenasBilhete.length === 3 &&
        dezenasBilhete.every((d) => dezenasValidas.includes(d))
      );
    });

    if (!ganhadores.length) {
      await prisma.bilhete.updateMany({
        where: { resultadoFederal: claimToken },
        data: {
          status: "NAO_PREMIADO",
          resultadoFederal: resultadoStr,
          apuradoEm: agora,
        },
      });

      const novoPremio = Number((premioAtual + arrecadacaoDaRodada * 0.3).toFixed(2));
      await persistirPremioAtual(novoPremio);

      return { ok: true, ganhou: false };
    }

    const valorPorGanhador = Number((premioAtual / ganhadores.length).toFixed(2));

    for (const bilhete of ganhadores) {
      await garantirCarteira(bilhete.userId);

      await prisma.$transaction([
        prisma.wallet.updateMany({
          where: { userId: bilhete.userId },
          data: {
            saldo: { increment: valorPorGanhador },
          },
        }),

        prisma.transacao_carteira.create({
          data: {
            userId: bilhete.userId,
            valor: valorPorGanhador,
            tipo: "PREMIO",
            status: "paid",
            metadata: { bilheteId: bilhete.id, sorteioData: inicio.toISOString() },
          },
        }),

        prisma.bilhete.update({
          where: { id: bilhete.id },
          data: {
            status: "PREMIADO",
            premioValor: valorPorGanhador,
            resultadoFederal: resultadoStr,
            apuradoEm: agora,
          },
        }),
      ]);
    }

    await prisma.bilhete.updateMany({
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

    await persistirPremioAtual(PREMIO_INICIAL);

    return {
      ok: true,
      ganhadores: ganhadores.length,
      valorPorGanhador,
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