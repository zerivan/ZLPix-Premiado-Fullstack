// backend/src/services/sorteio-processor.ts
import { prisma } from "../lib/prisma";

/**
 * ============================
 * 🎯 PROCESSADOR DE SORTEIO
 * ============================
 * Executa TODA a lógica automática:
 * - Analisa bilhetes ATIVOS
 * - Identifica ganhadores
 * - Divide prêmio
 * - Credita carteira
 * - Atualiza status dos bilhetes
 */

type ResultadoOficial = {
  dezenas: string[]; // dezenas sorteadas (ex: ["12","45","98"])
  premioTotal: number; // valor total do prêmio
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
    console.log("Nenhum bilhete ativo para o sorteio:", sorteioData);
    return;
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
      data: { status: "NAO_PREMIADO" },
    });

    console.log("Sorteio sem ganhadores. Prêmio acumulado.");
    return;
  }

  // ============================
  // 4️⃣ CALCULAR DIVISÃO DO PRÊMIO
  // ============================
  const valorPorGanhador =
    resultado.premioTotal / ganhadores.length;

  // ============================
  // 5️⃣ PROCESSAR GANHADORES
  // ============================
  for (const bilhete of ganhadores) {
    await prisma.$transaction([
      // 💰 CREDITAR CARTEIRA
      prisma.wallet.updateMany({
        where: { userId: bilhete.userId },
        data: {
          saldo: {
            increment: valorPorGanhador,
          },
        },
      }),

      // 🧾 REGISTRAR TRANSAÇÃO DE PRÊMIO
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
          },
        },
      }),

      // 🏆 MARCAR BILHETE COMO PREMIADO
      prisma.bilhete.update({
        where: { id: bilhete.id },
        data: {
          status: "PREMIADO",
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
    data: { status: "NAO_PREMIADO" },
  });

  console.log(
    `Sorteio processado com sucesso. Ganhadores: ${ganhadores.length}`
  );
}