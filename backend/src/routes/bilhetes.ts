import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * ❌ CRIAÇÃO DIRETA DE BILHETE BLOQUEADA
 */
router.post("/criar", async (_req, res) => {
  return res.status(400).json({
    error:
      "Criação direta de bilhete desativada. Utilize o fluxo de pagamento PIX ou carteira.",
  });
});

/**
 * Função: próxima quarta-feira às 20h
 */
function proximaQuarta(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 dom | 3 qua
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

/**
 * Criar bilhete PAGANDO COM SALDO (CARTEIRA)
 */
router.post("/pagar-com-saldo", async (req, res) => {
  try {
    const { userId, dezenas, valorTotal } = req.body;

    if (!userId || !Array.isArray(dezenas) || dezenas.length === 0) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const valor = Number(valorTotal) || 2.0;
    const dezenasStr = dezenas.join(",");

    const wallet = await prisma.wallet.findFirst({
      where: { userId },
    });

    if (!wallet) {
      return res.status(400).json({ error: "Carteira não encontrada." });
    }

    if (Number(wallet.saldo) < valor) {
      return res.status(400).json({ error: "Saldo insuficiente." });
    }

    await prisma.$transaction(async (tx) => {
      const transacao = await tx.transacao.create({
        data: {
          userId,
          valor,
          status: "completed",
          metadata: {
            tipo: "saida",
            origem: "aposta",
          },
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          saldo: { decrement: valor },
        },
      });

      await tx.bilhete.create({
        data: {
          userId,
          dezenas: dezenasStr,
          valor,
          pago: true,
          status: "ATIVO",
          sorteioData: proximaQuarta(),
          transacaoId: transacao.id,
        },
      });
    });

    return res.json({ status: "ok" });
  } catch (e) {
    console.error("Erro ao pagar bilhete com saldo:", e);
    return res.status(500).json({ error: "Erro interno." });
  }
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
        status: "ATIVO",
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
 * Listar bilhetes de um usuário (APP)
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