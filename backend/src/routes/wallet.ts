// backend/src/routes/wallet.ts
import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * 🔐 Middleware simples para identificar usuário
 * (usa USER_ID que já existe no projeto)
 */
function getUserId(req: any): number | null {
  const userId =
    req.headers["x-user-id"] ||
    req.query.userId ||
    req.body?.userId;

  if (!userId) return null;
  const n = Number(userId);
  return Number.isNaN(n) ? null : n;
}

/**
 * =========================
 * GET /wallet/saldo
 * =========================
 * Retorna o saldo atual da carteira
 */
router.get("/saldo", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    return res.json({
      saldo: wallet ? Number(wallet.saldo) : 0,
    });
  } catch (err) {
    console.error("Erro ao buscar saldo:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * =========================
 * POST /wallet/depositar
 * =========================
 * Cria uma transação PIX de DEPÓSITO
 * O saldo só é creditado no webhook
 */
router.post("/depositar", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { valor } = req.body;

    if (!userId || !valor || Number(valor) <= 0) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // garante que a wallet existe
    const walletExistente = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!walletExistente) {
      await prisma.wallet.create({
        data: {
          user: {
            connect: { id: userId },
          },
          saldo: 0,
          createdAt: new Date(), // 👈 O CAMPO QUE FALTAVA
        },
      });
    }

    // cria transação PIX (tipo DEPÓSITO)
    const transacao = await prisma.transacao.create({
      data: {
        userId,
        valor: Number(valor),
        status: "pending",
        metadata: {
          tipo: "deposito",
        },
      },
    });

    // redireciona para o fluxo PIX já existente
    return res.json({
      redirectUrl: `/pix?transacaoId=${transacao.id}`,
    });
  } catch (err) {
    console.error("Erro ao criar depósito:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;