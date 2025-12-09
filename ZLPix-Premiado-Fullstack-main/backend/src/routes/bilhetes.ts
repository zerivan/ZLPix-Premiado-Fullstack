// src/routes/bilhetes.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Função que converte BigInt -> string
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
      bilhete: serializeBigInt(bilhete), // ← aqui está a correção
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
      bilhetes: serializeBigInt(bilhetes), // ← correção aqui também
    });
  } catch (err) {
    console.error("Erro ao listar bilhetes:", err);
    return res.status(500).json({ error: "Erro ao carregar bilhetes." });
  }
});

export default router;