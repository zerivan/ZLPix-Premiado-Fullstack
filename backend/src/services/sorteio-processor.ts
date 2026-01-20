import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
  premioTotal?: number;
};

const PREMIO_BASE = 500;

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

// 🔐 GARANTE QUE A CARTEIRA EXISTE
async function garantirCarteira(userId: number) {
  const wallet = await prisma.wallet.findFirst({
    where: { userId },
  });

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
      sorteioData: { gte: inicioDia, lte: fimDia },
    },
  });

  if (!bilhetes.length) {
    return { ok: false, message: "Nenhum bilhete para processar" };
  }

  const dezenasValidas = resultado.dezenas.map((d) => d.trim());
  const resultadoStr = dezenasValidas.join(",");
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

  // ❌ SEM GANHADORES
  if (!ganhadores.length) {
    await prisma.bilhete.updateMany({
      where: { id: { in: bilhetes.map((b) => b.id) } },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: resultadoStr.slice(0, 20),
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

    return { ok: true };
  }

  // 🏆 COM GANHADORES
  const valorPorGanhador = premioAtual / ganhadores.length;

  for (const bilhete of ganhadores) {
    // 🔐 GARANTE CARTEIRA
    await garantirCarteira(bilhete.userId);

    await prisma.$transaction([
      prisma.wallet.update({
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
          resultadoFederal: resultadoStr.slice(0, 20),
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

  const perdedores = bilhetes.filter(
    (b) => !idsGanhadores.includes(b.id)
  );

  const usersPerdedores = [
    ...new Set(perdedores.map((b) => b.userId)),
  ];

  for (const userId of usersPerdedores) {
    await notify({
      type: "SORTEIO_REALIZADO",
      userId: String(userId),
      ganhou: false,
    });
  }

  await atualizarPremio(PREMIO_BASE);

  return {
    ok: true,
    ganhadores: ganhadores.length,
    valorPorGanhador,
  };
}