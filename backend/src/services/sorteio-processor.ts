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

// 🔧 CORREÇÃO: dezenas válidas são SEMPRE 2 dígitos
function isDezenaValida(valor: string): boolean {
  const numero = String(valor || "").replace(/\D/g, "");
  return numero.length === 2;
}

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  if (
    !Array.isArray(resultado.dezenas) ||
    resultado.dezenas.length === 0 ||
    resultado.dezenas.some((d) => !isDezenaValida(d))
  ) {
    throw new Error("Resultado inválido recebido no sorteio");
  }

  const inicio = new Date(sorteioData);
  inicio.setHours(0, 0, 0, 0);

  const fim = new Date(sorteioData);
  fim.setHours(23, 59, 59, 999);

  const claimToken = `PROCESSANDO_${inicio.toISOString()}`;

  await prisma.bilhete.updateMany({
    where: {
      pago: true,
      status: "ATIVO",
      apuradoEm: null,
      resultadoFederal: { startsWith: "PROCESSANDO_" },
      sorteioData: { gte: inicio, lte: fim },
    },
    data: {
      resultadoFederal: null,
    },
  });

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
      new Set(
        resultado.dezenas.flatMap((numero) =>
          extrairDezenasValidas(numero)
        )
      )
    );

    const resultadoStr = resultado.dezenas
      .map((n) => String(n || "").replace(/\D/g, ""))
      .filter(Boolean)
      .join(",");

    const agora = new Date();
    const premioAtual = await obterPremioAtualPersistido();

    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas
        .split(",")
        .map((d) => normalizarDezena(d))
        .filter(Boolean);

      return (
        dezenasBilhete.length === 3 &&
        dezenasBilhete.every((d) =>
          dezenasValidas.includes(d)
        )
      );
    });

    await prisma.$transaction(async (tx) => {
      const bilhetesDaRodada = await tx.bilhete.findMany({
        where: {
          pago: true,
          status: "ATIVO",
          apuradoEm: null,
          sorteioData: { gte: inicio, lte: fim },
        },
        select: { valor: true },
      });

      const arrecadacaoDaRodada = Number(
        bilhetesDaRodada
          .reduce(
            (acc, b) => acc + (Number(b.valor) || 0),
            0
          )
          .toFixed(2)
      );

      if (!ganhadores.length) {
        await tx.bilhete.updateMany({
          where: { resultadoFederal: claimToken },
          data: {
            status: "NAO_PREMIADO",
            resultadoFederal: resultadoStr,
            apuradoEm: agora,
          },
        });

        const novoPremio = Number(
          (premioAtual + arrecadacaoDaRodada * 0.3).toFixed(2)
        );

        await tx.appContent.upsert({
          where: { key: PREMIO_ATUAL_KEY },
          update: {
            contentHtml: String(novoPremio),
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
            contentHtml: String(novoPremio),
            enabled: true,
            isActive: true,
          },
        });

        return;
      }

      const valorPorGanhador = Number(
        (premioAtual / ganhadores.length).toFixed(2)
      );

      for (const bilhete of ganhadores) {
        await tx.wallet.upsert({
          where: { userId: bilhete.userId },
          update: {},
          create: {
            userId: bilhete.userId,
            saldo: 0,
            createdAt: new Date(),
          },
        });

        await tx.wallet.updateMany({
          where: { userId: bilhete.userId },
          data: {
            saldo: { increment: valorPorGanhador },
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
          where: { id: bilhete.id },
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

      await tx.appContent.upsert({
        where: { key: PREMIO_ATUAL_KEY },
        update: {
          contentHtml: String(PREMIO_INICIAL),
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
          contentHtml: String(PREMIO_INICIAL),
          enabled: true,
          isActive: true,
        },
      });
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