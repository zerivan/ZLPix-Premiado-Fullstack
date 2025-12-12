import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * Criar 1 bilhete (fluxo correto)
 * O frontend envia:
 * {
 *   userId: number,
 *   dezenas: string[],   // exemplo: ["12","34","56"]
 *   valorTotal: number
 * }
 *
 * 👉 NÃO EXIGE transacaoId
 * 👉 Transacao será criada depois no PIX
 */
router.post("/criar", async (req, res) => {
  try {
    const { userId, dezenas, valorTotal } = req.body;

    if (!userId || !Array.isArray(dezenas) || dezenas.length === 0) {
      return res.status(400).json({ error: "Dados inválidos para criação do bilhete." });
    }

    // dezenas: ["12","34","56"] → concatenar em string "12,34,56"
    const dezenasStr = dezenas.join(",");

    const bilhete = await prisma.bilhete.create({
      data: {
        userId,
        dezenas: dezenasStr,
        valor: Number(valorTotal) || 2.0,
        pago: false,
        sorteioData: new Date(),
      },
    });

    return res.json({ status: "ok", bilhete });
  } catch (e) {
    console.error("Erro ao criar bilhete:", e);
    return res.status(500).json({ error: "Erro interno ao criar bilhete." });
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