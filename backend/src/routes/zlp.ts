import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const normalizarSaldo = (valor: unknown): number => {
  const saldoNumerico = Number(valor);
  return Number.isFinite(saldoNumerico) ? saldoNumerico : 0;
};

// 🔥 FUNÇÃO SEGURA PARA PEGAR USER ID
function getUserId(req: any): number | null {
  const raw =
    req.headers["x-user-id"] ??
    req.query.userId;

  const valor = Array.isArray(raw) ? raw[0] : raw;
  const userId = Number(valor);

  if (!Number.isFinite(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

router.get("/saldo", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const zlp = await prisma.userZLP.upsert({
      where: { userId },
      update: {},
      create: { userId, saldo: 0 },
    });

    return res.json({ saldo: normalizarSaldo(zlp.saldo) });
  } catch (error) {
    console.error("[ZLP] saldo:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/checkin", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const zlp = await prisma.userZLP.upsert({
      where: { userId },
      update: {},
      create: { userId, saldo: 0 },
    });

    if (zlp.lastCheckin && zlp.lastCheckin >= hoje) {
      return res.json({
        ok: false,
        message: "Já coletou hoje",
        saldo: normalizarSaldo(zlp.saldo),
      });
    }

    const ganho = 20;

    // 🔧 ALTERAÇÃO CIRÚRGICA: update seguro
    await prisma.userZLP.updateMany({
      where: { userId },
      data: {
        saldo: { increment: ganho },
        lastCheckin: new Date(),
      },
    });

    // 🔧 GARANTE retorno consistente após update
    const atualizado = await prisma.userZLP.findUnique({
      where: { userId },
    });

    return res.json({
      ok: true,
      ganho,
      saldo: normalizarSaldo(atualizado?.saldo),
    });
  } catch (error) {
    console.error("[ZLP] checkin:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/resgatar", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const CUSTO = 2000;

    const zlp = await prisma.userZLP.findUnique({
      where: { userId },
    });

    if (!zlp || zlp.saldo < CUSTO) {
      return res.status(400).json({
        error: "Saldo insuficiente",
      });
    }

    const dezenas = Array.from({ length: 3 })
      .map(() => String(Math.floor(Math.random() * 100)).padStart(2, "0"))
      .join(",");

    const sorteioData = new Date();
    sorteioData.setDate(sorteioData.getDate() + 1);
    sorteioData.setHours(20, 0, 0, 0);

    await prisma.$transaction(async (tx) => {
      await tx.userZLP.update({
        where: { userId },
        data: {
          saldo: { decrement: CUSTO },
        },
      });

      await tx.bilhete.create({
        data: {
          userId,
          dezenas,
          valor: 0,
          pago: true,
          status: "ATIVO",
          sorteioData,
        },
      });
    });

    return res.json({
      ok: true,
      message: "Bilhete gerado com sucesso",
    });
  } catch (error) {
    console.error("[ZLP] resgatar:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;