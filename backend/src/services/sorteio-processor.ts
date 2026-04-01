import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[]; // 5 números completos da Federal
};

const PREMIO_BASE = 500;

/**
 * ============================
 * PRÊMIO ATUAL
 * ============================
 */
async function obterPremioAtual(): Promise<number> {
  const row = await prisma.appContent.findUnique({
    where: { key: "premio_atual" },
  });

  if (!row || !row.contentHtml) {
    await prisma.appContent.upsert({
      where: { key: "premio_atual" },
      update: { contentHtml: String(PREMIO_BASE) },
      create: {
        key: "premio_atual",
        title: "Prêmio Atual",
        contentHtml: String(PREMIO_BASE),
      },
    });
    return PREMIO_BASE;
  }

  const textoLimpo = row.contentHtml.replace(/<[^>]*>/g, "").trim();
  const valor = Number(textoLimpo);

  return isNaN(valor) || valor <= 0 ? PREMIO_BASE : valor;
}

async function atualizarPremio(valor: number) {
  await prisma.appContent.upsert({
    where: { key: "premio_atual" },
    update: { contentHtml: String(valor) },
    create: {
      key: "premio_atual",
      title: "Prêmio Atual",
      contentHtml: String(valor),
    },
  });
}

/**
 * ============================
 * GARANTE CARTEIRA (CORRIGIDO)
 * ============================
 */
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

/**
 * ============================
 * MOTOR OFICIAL DO SORTEIO
 * ============================
 */
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
    const jaProcessado = await prisma.bilhete.findFirst({
      where: {
        sorteioData: { gte: inicio, lte: fim },
        apuradoEm: { not: null },
      },
      select: { id: true },
    });

    if (jaProcessado) {
      console.log("⛔ Sorteio já processado para essa data.");
      return { ok: false, message: "Sorteio já processado" };
    }

    const emProcessamento = await prisma.bilhete.findFirst({
      where: {
        sorteioData: { gte: inicio, lte: fim },
        status: "ATIVO",
        apuradoEm: null,
        resultadoFederal: { startsWith: "PROCESSANDO_" },
      },
      select: { id: true },
    });

    if (emProcessamento) {
      return { ok: false, message: "Sorteio em processamento" };
    }

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
        resultado.dezenas.flatMap((numeroCompleto) => {
          const numero = numeroCompleto.trim();
          const milhar = numero.slice(-4);
          const dezenaInicial = milhar.slice(0, 2);
          const dezenaFinal = milhar.slice(2, 4);
          return [dezenaInicial, dezenaFinal];
        })
      )
    );

    const resultadoStr = resultado.dezenas.join(",");
    const agora = new Date();
    const premioAtual = await obterPremioAtual();

    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas
        .split(",")
        .map((d) => d.trim())
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

      await atualizarPremio(premioAtual + PREMIO_BASE);

      const users = [...new Set(bilhetes.map((b) => b.userId))];

      for (const userId of users) {
        await notify({
          type: "SORTEIO_REALIZADO",
          userId: String(userId),
          ganhou: false,
        });
      }

      return { ok: true, ganhou: false };
    }

    const valorPorGanhador = premioAtual / ganhadores.length;

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
            metadata: {
              origem: "sorteio",
              bilheteId: bilhete.id,
            },
          },
        }),

        prisma.transacao.create({
          data: {
            userId: bilhete.userId,
            valor: valorPorGanhador,
            tipo: "BILHETE",
            status: "paid",
            metadata: {
              tipo: "bilhete_premiado",
              origem: "sorteio",
              bilheteId: bilhete.id,
            },
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

      await notify({
        type: "SORTEIO_REALIZADO",
        userId: String(bilhete.userId),
        ganhou: true,
        valor: valorPorGanhador,
      });
    }

    const idsGanhadores = ganhadores.map((b) => b.id);

    await prisma.bilhete.updateMany({
      where: {
        resultadoFederal: claimToken,
        id: { notIn: idsGanhadores },
      },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: resultadoStr,
        apuradoEm: agora,
      },
    });

    await atualizarPremio(PREMIO_BASE);

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
        status: "ATIVO",
        sorteioData: { gte: inicio, lte: fim },
      },
      data: {
        resultadoFederal: null,
      },
    });

    throw error;
  }
}