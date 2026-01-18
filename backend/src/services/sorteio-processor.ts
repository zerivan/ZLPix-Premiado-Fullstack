import { prisma } from "../lib/prisma";

/**
 * ============================
 * 🎯 PROCESSADOR DE SORTEIO
 * ============================
 * MOTOR FUNCIONAL (SEM TRAVAS)
 */

type ResultadoOficial = {
  dezenas: string[];
  premioTotal: number;
};

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  const inicioDia = new Date(sorteioData);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(sorteioData);
  fimDia.setHours(23, 59, 59, 999);

  // ============================
  // 1️⃣ BUSCAR BILHETES ATIVOS DO DIA
  // ============================
  const bilhetes = await prisma.bilhete.findMany({
    where: {
      status: "ATIVO",
      sorteioData: {
        gte: inicioDia,
        lte: fimDia,
      },
    },
  });

  if (!bilhetes.length) {
    console.log("⚠️ Nenhum bilhete ativo encontrado para o sorteio.");
    return {
      ok: false,
      message: "Nenhum bilhete para processar",
    };
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

  const resultadoStr = resultado.dezenas.join(",");
  const agora = new Date();

  // ============================
  // 3️⃣ SEM GANHADORES → MARCA NÃO PREMIADOS
  // ============================
  if (!ganhadores.length) {
    await prisma.bilhete.updateMany({
      where: {
        id: { in: bilhetes.map((b) => b.id) },
      },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: resultadoStr.slice(0, 20),
        apuradoEm: agora,
      },
    });

    console.log("ℹ️ Sorteio processado sem ganhadores.");
    return {
      ok: true,
      message: "Sorteio sem ganhadores",
    };
  }

  // ============================
  // 4️⃣ CALCULAR PRÊMIO
  // ============================
  const valorPorGanhador =
    resultado.premioTotal / ganhadores.length;

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
          },
        },
      }),

      prisma.bilhete.update({
        where: { id: bilhete.id },
        data: {
          status: "PREMIADO",
          premioValor: valorPorGanhador,
          resultadoFederal: resultadoStr.slice(0, 20),
          apuradoEm: agora,
        },
      }),
    ]);
  }

  // ============================
  // 6️⃣ MARCAR DEMAIS COMO NÃO PREMIADOS
  // ============================
  const idsGanhadores = ganhadores.map((b) => b.id);

  await prisma.bilhete.updateMany({
    where: {
      id: {
        in: bilhetes.map((b) => b.id),
        notIn: idsGanhadores,
      },
    },
    data: {
      status: "NAO_PREMIADO",
      resultadoFederal: resultadoStr.slice(0, 20),
      apuradoEm: agora,
    },
  });

  console.log(
    `✅ Sorteio finalizado. Ganhadores: ${ganhadores.length}`
  );

  return {
    ok: true,
    ganhadores: ganhadores.length,
    valorPorGanhador,
  };
}