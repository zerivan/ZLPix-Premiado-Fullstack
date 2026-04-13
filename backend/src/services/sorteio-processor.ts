import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
};

const PREMIO_BASE = 500;
const PERCENTUAL_PREMIO = 0.3; // 🔥 30% das vendas

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

    /**
     * 🔥 CALCULA ARRECADAÇÃO DA RODADA
     */
    const totalArrecadado = bilhetes.reduce(
      (acc, b) => acc + Number(b.valor || 0),
      0
    );

    const incrementoPremio = totalArrecadado * PERCENTUAL_PREMIO;

    /**
     * ============================
     * DEZENAS (MILHAR)
     * ============================
     */
    const dezenasValidas = Array.from(
      new Set(
        resultado.dezenas.flatMap((numeroCompleto) => {
          const numero = numeroCompleto.replace(/\D/g, "").padStart(5, "0");
          const milhar = numero.slice(-4);

          const dezenaInicial = normalizarDezena(milhar.slice(0, 2));
          const dezenaFinal = normalizarDezena(milhar.slice(2, 4));

          return [dezenaInicial, dezenaFinal];
        })
      )
    );

    const resultadoStr = resultado.dezenas
      .map((n) => n.replace(/\D/g, ""))
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

    /**
     * 🔁 SEM GANHADOR → ACUMULA DINÂMICO
     */
    if (!ganhadores.length) {
      await prisma.bilhete.updateMany({
        where: { resultadoFederal: claimToken },
        data: {
          status: "NAO_PREMIADO",
          resultadoFederal: resultadoStr,
          apuradoEm: agora,
        },
      });

      await atualizarPremio(
        premioAtual + PREMIO_BASE + incrementoPremio
      );

      return { ok: true, ganhou: false };
    }

    /**
     * 🏆 COM GANHADOR → DIVIDE
     */
    const valorPorGanhador = Number(
      (premioAtual / ganhadores.length).toFixed(2)
    );

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

    await atualizarPremio(PREMIO_BASE); // 🔥 RESET

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