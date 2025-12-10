// src/routes/bilhetes.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Converte BigInt → string
function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(
      obj,
      (_key, value) => (typeof value === "bigint" ? value.toString() : value)
    )
  );
}

/**
 * Criar bilhete
 */
router.post("/criar", async (req, res) => {
  try {
    const { userId, dezenas, valor, sorteioData } = req.body;

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ error: "userId inválido." });
    }
    if (!dezenas || !valor || !sorteioData) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const bilhete = await prisma.bilhete.create({
      data: {
        userId: BigInt(Number(userId)),
        dezenas,
        valor,
        sorteioData: new Date(sorteioData),
      },
    });

    return res.json({
      ok: true,
      bilhete: serializeBigInt(bilhete),
    });
  } catch (err) {
    console.error("Erro ao criar bilhete:", err);
    return res.status(500).json({ error: "Erro ao criar bilhete." });
  }
});

/**
 * Listar bilhetes
 */
router.get("/listar/:userId", async (req, res) => {
  try {
    const userIdParam = req.params.userId;

    if (!userIdParam || isNaN(Number(userIdParam))) {
      return res.status(400).json({ error: "userId inválido." });
    }

    const userId = BigInt(Number(userIdParam));

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { transacao: true },
    });

    return res.json({
      bilhetes: serializeBigInt(bilhetes),
    });
  } catch (err) {
    console.error("Erro ao listar bilhetes:", err);
    return res.status(500).json({ error: "Erro ao carregar bilhetes." });
  }
});

/**
 * 🔍 ROTA DE STATUS DO PIX (corrigida)
 */
router.get("/status/:id", async (req, res) => {
  try {
    const idParam = req.params.id;

    if (!idParam || isNaN(Number(idParam))) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const id = BigInt(Number(idParam));

    const bilhete = await prisma.bilhete.findUnique({
      where: { id },
      include: { transacao: true },
    });

    if (!bilhete) {
      return res.status(404).json({ error: "Bilhete não encontrado." });
    }

    // ⚠️ Novo status correto
    const pago =
      bilhete.transacao?.status === "paid" ||
      bilhete.transacao?.status === "approved";

    return res.json({
      id: bilhete.id.toString(),
      pago,
    });
  } catch (err) {
    console.error("Erro ao verificar status:", err);
    return res.status(500).json({ error: "Erro interno ao verificar status." });
  }
});

export default router;