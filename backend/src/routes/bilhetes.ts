// src/routes/bilhetes.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// 🔧 Converte BigInt → string para evitar erro no JSON
function serializeBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
}

/* ============================================================
   🟡 CRIAR BILHETE
   ============================================================ */
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
        userId: BigInt(userId),
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

/* ============================================================
   🔵 LISTAR BILHETES DO USUÁRIO
   ============================================================ */
router.get("/listar/:userId", async (req, res) => {
  try {
    const userIdParam = req.params.userId;

    if (!userIdParam || isNaN(Number(userIdParam))) {
      return res.status(400).json({ error: "userId inválido." });
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId: BigInt(userIdParam) },
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

/* ============================================================
   🔍 STATUS DO BILHETE (USADO NA TELA DE PAGAMENTO)
   ============================================================ */
router.get("/status/:id", async (req, res) => {
  try {
    const idParam = req.params.id;

    if (!idParam || isNaN(Number(idParam))) {
      return res.status(400).json({ error: "ID inválido." });
    }

    const bilhete = await prisma.bilhete.findUnique({
      where: { id: BigInt(idParam) },
      include: { transacao: true },
    });

    if (!bilhete) {
      return res.status(404).json({ error: "Bilhete não encontrado." });
    }

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