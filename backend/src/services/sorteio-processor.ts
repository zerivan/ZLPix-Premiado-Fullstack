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

  const ganhadores = bilhetes.filter((b) => {
    const dezenasBilhete = b.dezenas
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    if (dezenasBilhete.length !== 3) return false;

    return dezenasBilhete.every((d) =>
      dezenasValidas.includes(d)
    );
  });

  const resultadoStr = dezenasValidas.join(",");
  const agora = new Date();

  const premioAtual = await obterPremioAtual();

  /**
   * ======================================
   * ❌ SEM GANHADORES
   * ======================================
   */
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

    // 🔔 NOTIFICA TODOS OS PARTICIPANTES
    for (const b of bilhetes) {
      await notify({
        type: "SORTEIO_REALIZADO",
        userId: String(b.userId),
        ganhou: false,
      });
    }

    return {
      ok: true,
      message: "Sorteio sem ganhadores",
      premioAtual: premioAtual + PREMIO_BASE,
    };
  }

  /**
   * ======================================
   * 🏆 COM GANHADORES
   * ======================================
   */
  const valorPorGanhador = premioAtual / ganhadores.length;

  for (const bilhete of ganhadores) {
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
          resultadoFederal: resultadoStr.slice(0, 20),
          apuradoEm: agora,
        },
      }),
    ]);

    // 🔔 NOTIFICA GANHADOR
    await notify({
      type: "SORTEIO_REALIZADO",
      userId: String(bilhete.userId),
      ganhou: true,
      valor: valorPorGanhador,
    });
  }

  const idsGanhadores = ganhadores.map((b) => b.id);

  const perdedores = bilhetes.filter(
    (b) => !idsGanhadores.includes(b.id)
  );

  await prisma.bilhete.updateMany({
    where: {
      id: { in: perdedores.map((b) => b.id) },
    },
    data: {
      status: "NAO_PREMIADO",
      resultadoFederal: resultadoStr.slice(0, 20),
      apuradoEm: agora,
    },
  });

  // 🔔 NOTIFICA PERDEDORES
  for (const b of perdedores) {
    await notify({
      type: "SORTEIO_REALIZADO",
      userId: String(b.userId),
      ganhou: false,
    });
  }

  await atualizarPremio(PREMIO_BASE);

  return {
    ok: true,
    ganhadores: ganhadores.length,
    valorPorGanhador,
    premioResetadoPara: PREMIO_BASE,
  };
}