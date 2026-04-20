import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/saldo", async (req, res) => {
  try {
    const userId =
      Number(req.headers["x-user-id"]) ||
      Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    let zlp = await prisma.userZLP.findUnique({
      where: { userId },
    });

    if (!zlp) {
      zlp = await prisma.userZLP.create({
        data: { userId, saldo: 0 },
      });
    }

    return res.json({ saldo: zlp.saldo });
  } catch (error) {
    console.error("[ZLP] saldo:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

router.post("/checkin", async (req, res) => {
  try {
    const userId =
      Number(req.headers["x-user-id"]) ||
      Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let zlp = await prisma.userZLP.findUnique({
      where: { userId },
    });

    if (!zlp) {
      zlp = await prisma.userZLP.create({
        data: { userId, saldo: 0 },
      });
    }

    if (zlp.lastCheckin && zlp.lastCheckin >= hoje) {
      return res.json({
        ok: false,
        message: "Já coletou hoje",
        saldo: zlp.saldo,
      });
    }

    const ganho = 20;

    const atualizado = await prisma.userZLP.update({
      where: { userId },
      data: {
        saldo: { increment: ganho },
        lastCheckin: new Date(),
      },
    });

    return res.json({
      ok: true,
      ganho,
      saldo: atualizado.saldo,
    });
  } catch (error) {
    console.error("[ZLP] checkin:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;