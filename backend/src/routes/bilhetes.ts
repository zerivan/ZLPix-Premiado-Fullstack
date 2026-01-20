import { Router } from "express";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = Router();

/**
 * ============================
 * LISTAR BILHETES DO USUÁRIO (MEUS)
 * ============================
 * Compatibilidade com o front-end
 * GET /bilhete/meus
 */
router.get("/meus", async (req, res) => {
  try {
    const userId =
      Number(req.headers["x-user-id"]) ||
      Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(bilhetes);
  } catch (error) {
    console.error("Erro ao listar meus bilhetes:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * LISTAR BILHETES DO USUÁRIO
 * ============================
 */
router.get("/", async (req, res) => {
  try {
    const userId =
      Number(req.headers["x-user-id"]) ||
      Number(req.query.userId);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(bilhetes);
  } catch (error) {
    console.error("Erro ao listar bilhetes:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * DETALHE DE UM BILHETE
 * ============================
 */
router.get("/:id", async (req, res) => {
  try {
    const userId =
      Number(req.headers["x-user-id"]) ||
      Number(req.query.userId);

    const id = Number(req.params.id);

    if (!userId || !id) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const bilhete = await prisma.bilhete.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!bilhete) {
      return res.status(404).json({ error: "Bilhete não encontrado" });
    }

    return res.json(bilhete);
  } catch (error) {
    console.error("Erro ao buscar bilhete:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * NOTIFICAÇÃO (BACKUP)
 * ============================
 * Caso algum bilhete antigo exista sem notificação
 */
router.post("/notify/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const bilhete = await prisma.bilhete.findUnique({
      where: { id },
    });

    if (!bilhete) {
      return res.status(404).json({ error: "Bilhete não encontrado" });
    }

    await notify({
      type: "BILHETE_CRIADO",
      userId: String(bilhete.userId),
      codigo: String(bilhete.id),
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("Erro notify bilhete:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;