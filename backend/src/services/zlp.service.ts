import { prisma } from "../lib/prisma";

export async function obterOuCriarZLP(userId: number) {
  let zlp = await prisma.userZLP.findUnique({
    where: { userId },
  });

  if (!zlp) {
    zlp = await prisma.userZLP.create({
      data: { userId, saldo: 0 },
    });
  }

  return zlp;
}

export async function obterSaldoZLP(userId: number) {
  const zlp = await obterOuCriarZLP(userId);
  return zlp.saldo;
}

export async function realizarCheckinZLP(userId: number) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const zlp = await obterOuCriarZLP(userId);

  if (zlp.lastCheckin && zlp.lastCheckin >= hoje) {
    return {
      ok: false,
      saldo: zlp.saldo,
      message: "Já coletou hoje",
    };
  }

  const ganho = 20;

  const atualizado = await prisma.userZLP.update({
    where: { userId },
    data: {
      saldo: { increment: ganho },
      lastCheckin: new Date(),
    },
  });

  return {
    ok: true,
    ganho,
    saldo: atualizado.saldo,
  };
}