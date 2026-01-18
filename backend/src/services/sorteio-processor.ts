import { prisma } from "../lib/prisma";

/**
 * ============================
 * 🎯 PROCESSADOR DE SORTEIO
 * ============================
 */

type ResultadoOficial = {
  dezenas: string[];
  premioTotal: number;
};

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  // ============================
  // 1️⃣ BUSCAR BILHETES ATIVOS
  // ============================
  const bilhetes = await prisma.bilhete.findMany({
    where: {
      status: "ATIVO",
      sorteioData,
    },
  });

  if (!bilhetes.length) {
    throw new Error("Nenhum bilhete ativo para este sorteio");
  }

  // ============================
  // 2️⃣ IDENTIFICAR GANHADORES
  // ============================
  const ganhadores = bilhetes.filter((b) => {
    const dezenasBilhete = b.dezenas
      .split(",")
      .map((d) => d.trim());

    return dezenasBilhete.some((d) =>
      resultado.dezenas.includes(d)
    );
  });

  // ============================
  // 3️⃣ SE NÃO HOUVER GANHADOR
  // ============================
  if (!ganhadores.length) {
    await prisma.bilhete.updateMany({
      where: { id: { in: bilhetes.map((b) => b.id) } },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: resultado.dezenas.join(","),
        apuradoEm: new Date(),
      },
    });

    throw new Error("Sorteio processado sem ganhadores (prêmio acumulado)");
  }

  // ============================
  // 4️⃣ CALCULAR DIVISÃO DO PRÊMIO
  // ============================
  const valorPorGanhador =
    resultado.premioTotal / ganhadores.length;

  const resultadoStr = resultado.dezenas.join(",");
  const agora = new Date();

  // ============================
  // 5️⃣ PROCESSAR GANHADORES
  // ============================
  for (const bilhete of ganhadores) {
    await prisma.$transaction([
      prisma.wallet.updateMany({
        where: { userId: bilhete.userId },
        data: {
          saldo: {
            increment: valorPorGanhador,
          },
        },
      }),

      prisma.transacao.create({
        data: {
          userId: bilhete.userId,
          valor: valorPorGanhador,
          status: "paid",
          metadata: {
            tipo: "premio",
            origem: "sorteio",
            bilheteId: bilhete.id,
            sorteioData,
            resultado: resultadoStr,
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
  }

  // ============================
  // 6️⃣ MARCAR NÃO PREMIADOS
  // ============================
  const idsGanhadores = ganhadores.map((b) => b.id);

  await prisma.bilhete.updateMany({
    where: {
      sorteioData,
      status: "ATIVO",
      id: { notIn: idsGanhadores },
    },
    data: {
      status: "NAO_PREMIADO",
      resultadoFederal: resultadoStr,
      apuradoEm: agora,
    },
  });
}