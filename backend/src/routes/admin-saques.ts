import { Router } from "express";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = Router();

/**
 * ======================================
 * ADMIN — CONFIRMAR SAQUE (PAGAMENTO)
 * ======================================
 */
router.post("/pagar/:id", async (req, res) => {
  try {
    const saqueId = Number(req.params.id);

    const saque = await prisma.transacao.findUnique({
      where: { id: saqueId },
    });

    if (!saque) {
      return res.status(404).json({ error: "Saque não encontrado" });
    }

    if (saque.status === "paid") {
      return res.status(400).json({
        error: "Saque já foi pago",
      });
    }

    // 🔒 Garante que é saque
    const meta: any = saque.metadata || {};
    if (meta.tipo !== "saque") {
      return res.status(400).json({
        error: "Transação não é saque",
      });
    }

    await prisma.$transaction([
      prisma.wallet.updateMany({
        where: { userId: saque.userId },
        data: {
          saldo: {
            decrement: Number(saque.valor),
          },
        },
      }),
      prisma.transacao.update({
        where: { id: saque.id },
        data: {
          status: "paid",
        },
      }),
    ]);

    // 🔔 NOTIFICAÇÃO — SAQUE PAGO
    await notify({
      type: "SAQUE_PAGO",
      userId: String(saque.userId),
      valor: Number(saque.valor),
    });

    return res.json({
      ok: true,
      message: "Saque pago com sucesso",
    });
  } catch (err) {
    console.error("Erro ao pagar saque:", err);
    return res.status(500).json({
      error: "Erro interno ao pagar saque",
    });
  }
});

export default router;