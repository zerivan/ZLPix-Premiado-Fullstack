import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
};

async function obterPremioAtual(): Promise<number> {
  const [arrecadadoAgg, premiosPagosAgg] = await Promise.all([
    prisma.transacao.aggregate({
      _sum: { valor: true },
      where: {
        status: "paid",
        tipo: "BILHETE",
      },
    }),
    prisma.transacao_carteira.aggregate({
      _sum: { valor: true },
      where: {
        status: "paid",
        tipo: "PREMIO",
      },
    }),
  ]);

  const arrecadado = Number(arrecadadoAgg._sum.valor) || 0;
  const premiosPagos = Number(premiosPagosAgg._sum.valor) || 0;

  return Number(
    Math.max(arrecadado * 0.3 - premiosPagos, 500).toFixed(2)
  );
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
    const premioAtual = await obterPremioAtual();

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