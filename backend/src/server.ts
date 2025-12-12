// backend/src/routes/bilhetes.ts
import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * Criar bilhetes vinculados a uma transação PIX
 * - Recebe: userId, dezenas[], valorTotal, transacaoId
 * - Cada bilhete entra com `pago = false`
 */
router.post("/criar", async (req, res) => {
  try {
    const { userId, dezenas, valorTotal, transacaoId } = req.body;

    if (!userId || !dezenas || !Array.isArray(dezenas) || dezenas.length === 0) {
      return res.status(400).json({ error: "Dados inválidos para criação de bilhetes." });
    }

    if (!transacaoId) {
      return res.status(400).json({ error: "transacaoId é obrigatório." });
    }

    // Cria todos os bilhetes associados à mesma transação
    const bilhetesCriados = await prisma.bilhete.createMany({
      data: dezenas.map((dezena: string) => ({
        userId,
        transacaoId,
        dezenas: dezena,   // Ex: "12,34,56"
        valor: valorTotal / dezenas.length,
        pago: false,
        sorteioData: new Date(),
      })),
    });

    return res.json({
      status: "ok",
      quantidade: bilhetesCriados.count,
      message: "Bilhetes criados com sucesso!",
    });
  } catch (e) {
    console.error("Erro ao criar bilhetes:", e);
    return res.status(500).json({ error: "Erro interno ao criar bilhetes." });
  }
});

/**
 * Listar bilhetes de um usuário
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