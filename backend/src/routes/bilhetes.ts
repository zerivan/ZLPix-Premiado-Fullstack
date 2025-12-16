import express from "express";
import { prisma } from "../lib/prisma";

const router = express.Router();

/**
 * ❌ CRIAÇÃO DIRETA DE BILHETE BLOQUEADA
 *
 * Essa rota NÃO pode mais ser usada para fluxo PIX,
 * pois ela ignora a página de pagamento.
 *
 * O fluxo correto é:
 * Revisão → Pagamento → Webhook → Finalização → Criação do bilhete
 */
router.post("/criar", async (req, res) => {
  return res.status(400).json({
    error:
      "Criação direta de bilhete desativada. Utilize o fluxo de pagamento PIX ou carteira.",
  });
});

/**
 * Criar bilhete PAGANDO COM SALDO (CARTEIRA)
 * 👉 NÃO cria PIX
 * 👉 Debita wallet
 * 👉 Cria transacao (saida/aposta)
 * 👉 Bilhete nasce pago
 */
router.post("/pagar-com-saldo", async (req, res) => {
  try {
    const { userId, dezenas, valorTotal } = req.body;

    if (!userId || !Array.isArray(dezenas) || dezenas.length === 0) {
      return res.status(400).json({ error: "Dados inválidos." });
    }

    const valor = Number(valorTotal) || 2.0;
    const dezenasStr = dezenas.join(",");

    // busca wallet
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
          sorteioData: new Date(),
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