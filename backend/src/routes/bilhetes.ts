import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * ❌ CRIAÇÃO DIRETA DE BILHETE BLOQUEADA
 */
router.post("/criar", async (_req, res) => {
  return res.status(400).json({
    error:
      "Criação direta de bilhete desativada. Utilize o fluxo de pagamento PIX.",
  });
});

/**
 * ============================
 * ADMIN — BILHETES DO SORTEIO ATUAL
 * ============================
 */
router.get("/admin/sorteio-atual", async (_req, res) => {
  try {
    const agora = new Date();

    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO_ATUAL",
        sorteioData: {
          gt: agora,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transacao: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      ok: true,
      total: bilhetes.length,
      bilhetes,
    });
  } catch (e) {
    console.error("Erro ao listar bilhetes do sorteio:", e);
    return res.status(500).json({ ok: false });
  }
});

/**
 * ============================
 * LISTAR BILHETES — APP (ROTA PRINCIPAL)
 * ============================
 * Header: x-user-id
 */
router.get("/meus", async (req, res) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(bilhetes);
  } catch (err) {
    console.error("Erro listar bilhetes:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * LISTAR BILHETES — DEBUG
 * ============================
 */
router.get("/listar/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bilhetes });
  } catch (e) {
    console.error("Erro ao listar bilhetes:", e);
    return res.status(500).json({ error: "erro interno" });
  }
});

export default router;
