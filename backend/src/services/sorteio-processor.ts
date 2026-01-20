// backend/src/services/sorteio-processor.ts

import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
  premioTotal?: number;
};

const PREMIO_BASE = 500;

async function garantirCarteira(userId: number) {
  const wallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!wallet) {
    await prisma.wallet.create({
      data: {
        userId,
        saldo: 0,
        createdAt: new Date(),
      },
    });
  }
}

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

  const valor = Number(row.contentHtml);
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

export async function processarSorteio(
  sorteioData: Date,
  resultado: ResultadoOficial
) {
  const inicioDia = new Date(sorteioData);
  inicioDia.setHours(0, 0, 0, 0);

  const fimDia = new Date(sorteioData);
  fimDia.setHours(23, 59, 59, 999);

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
    return { ok: false, message: "Nenhum bilhete para processar" };
  }

  const dezenasValidas = resultado.dezenas.map((d) => d.trim());
  const premioAtual = await obterPremioAtual();
  const agora = new Date();

  const ganhadores = bilhetes.filter((b) => {
    const dezenasBilhete = b.dezenas
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    return dezenasBilhete.length === 3 &&
      dezenasBilhete.every((d) => dezenasValidas.includes(d));
  });

  if (!ganhadores.length) {
    await prisma.bilhete.updateMany({
      where: { id: { in: bilhetes.map((b) => b.id) } },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: dezenasValidas.join(",").slice(0, 20),
        apuradoEm: agora,
      },
    });

    await atualizarPremio(premioAtual + PREMIO_BASE);

    return { ok: true, message: "Sorteio sem ganhadores" };
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
          resultadoFederal: dezenasValidas.join(",").slice(0, 20),
          apuradoEm: agora,
        },
      }),
    ]);

    // 🔔 NOTIFICAÇÃO DO PRÊMIO
    await notify({
      type: "SORTEIO_REALIZADO",
      userId: String(bilhete.userId),
      ganhou: true,
      valor: valorPorGanhador,
    });

    await notify({
      type: "CARTEIRA_CREDITO",
      userId: String(bilhete.userId),
      valor: valorPorGanhador,
    });
  }

  await atualizarPremio(PREMIO_BASE);

  return {
    ok: true,
    ganhadores: ganhadores.length,
    valorPorGanhador,
  };
}