import { prisma } from "../lib/prisma";
import { notify } from "./notify";

type ResultadoOficial = {
  dezenas: string[];
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

/**
 * ============================
 * GARANTE CARTEIRA
 * ============================
 */
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

  const bilhetes = await prisma.bilhete.findMany({
    where: {
      status: "ATIVO",
      sorteioData: { gte: inicio, lte: fim },
    },
  });

  if (!bilhetes.length) {
    return { ok: false, message: "Nenhum bilhete no sorteio" };
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

  /**
   * ============================
   * SEM GANHADORES
   * ============================
   */
  if (!ganhadores.length) {
    await prisma.bilhete.updateMany({
      where: { id: { in: bilhetes.map((b) => b.id) } },
      data: {
        status: "NAO_PREMIADO",
        resultadoFederal: resultadoStr,
        apuradoEm: agora,
      },
    });

    await atualizarPremio(premioAtual + PREMIO_BASE);

    const users = [...new Set(bilhetes.map((b) => b.userId))];
    console.log(`📢 Disparando notificações de sorteio sem ganhadores para ${users.length} usuário(s)`);
    for (const userId of users) {
      await notify({
        type: "SORTEIO_REALIZADO",
        userId: String(userId),
        ganhou: false,
      });
    }

    console.log(`✅ Sorteio processado sem ganhadores - ${bilhetes.length} bilhete(s) apurado(s)`);
    return { ok: true, ganhou: false };
  }

  /**
   * ============================
   * COM GANHADORES
   * ============================
   */
  console.log(`🏆 Sorteio COM ganhadores! ${ganhadores.length} ganhador(es) - Prêmio total: R$ ${premioAtual.toFixed(2)}`);
  const valorPorGanhador = premioAtual / ganhadores.length;

  for (const bilhete of ganhadores) {
    await garantirCarteira(bilhete.userId);

    await prisma.$transaction([
      // 1️⃣ Incrementar saldo da wallet
      prisma.wallet.updateMany({
        where: { userId: bilhete.userId },
        data: {
          saldo: { increment: valorPorGanhador },
        },
      }),

      // 2️⃣ Registro financeiro em transacao_carteira (tipo: PREMIO, status: paid)
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

      // 3️⃣ Registro de auditoria em transacao (para bilhete premiado)
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

      // 4️⃣ Atualizar status do bilhete
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

    console.log(`📢 Disparando notificação de prêmio para userId: ${bilhete.userId}, valor: R$ ${valorPorGanhador.toFixed(2)}`);
    await notify({
      type: "SORTEIO_REALIZADO",
      userId: String(bilhete.userId),
      ganhou: true,
      valor: valorPorGanhador,
    });
  }

  console.log(`✅ Prêmios creditados para ${ganhadores.length} ganhador(es)`);

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
}