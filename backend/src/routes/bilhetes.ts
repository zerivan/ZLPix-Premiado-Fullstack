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
 * 📆 Quarta-feira ATUAL às 20h (se ainda não passou)
 */
function quartaAtualOuProxima(): Date {
  const now = new Date();
  const day = now.getDay(); // 3 = quarta

  // Se hoje é quarta e ainda não passou das 20h
  if (day === 3 && now.getHours() < 20) {
    const hoje = new Date(now);
    hoje.setHours(20, 0, 0, 0);
    return hoje;
  }

  // Caso contrário, próxima quarta
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

/**
 * 📆 Próxima quarta-feira às 20h (sempre futuro)
 */
function proximaQuarta(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(20, 0, 0, 0);
  return next;
}

/**
 * ⏰ Decide se o bilhete vale para o sorteio atual ou próximo
 * Regra: quarta após 17h → próximo sorteio
 */
function definirStatusBilhete(): {
  status: "ATIVO_ATUAL" | "ATIVO_PROXIMO";
  sorteioData: Date;
} {
  const agora = new Date();
  const dia = agora.getDay(); // 3 = quarta
  const hora = agora.getHours();

  if (dia === 3 && hora >= 17) {
    return {
      status: "ATIVO_PROXIMO",
      sorteioData: proximaQuarta(),
    };
  }

  return {
    status: "ATIVO_ATUAL",
    sorteioData: quartaAtualOuProxima(),
  };
}

/**
 * ============================
 * CRIAR BILHETE PAGANDO COM SALDO (CARTEIRA)
 * ============================
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

    const { status, sorteioData } = definirStatusBilhete();

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
          status,
          sorteioData,
          transacaoId: transacao.id,
        },
      });
    });

    return res.json({ ok: true });
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
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO_ATUAL",
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
 * APP — LISTAR BILHETES DO USUÁRIO
 * ============================
 */
router.get("/listar/:userId", async (req, res) => {
  const userId = Number(req.params.userId);

  try {
    const bilhetes = await prisma.bilhete.findMany({
      where: {
        userId,
        status: {
          in: ["ATIVO_ATUAL", "ATIVO_PROXIMO"],
        },
      },
      orderBy: {
        sorteioData: "asc",
      },
    });

    return res.json({ bilhetes });
  } catch (e) {
    console.error("Erro ao listar bilhetes:", e);
    return res.status(500).json({ error: "erro interno" });
  }
});

export default router;
