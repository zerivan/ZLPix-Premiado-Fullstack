import { Router } from "express";
import { prisma } from "../lib/prisma";
import { notify } from "../services/notify";

const router = Router();

/**
 * ============================
 * LISTAR SAQUES PENDENTES
 * ============================
 */
router.get("/", async (_req, res) => {
  try {
    const saques = await prisma.transacao.findMany({
      where: {
        metadata: {
          path: ["tipo"],
          equals: "saque",
        },
        status: "pending",
      },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ ok: true, data: saques });
  } catch {
    return res.status(500).json({ ok: false });
  }
});

/**
 * ============================
 * CONFIRMAR PAGAMENTO DO SAQUE
 * ============================
 */
router.post("/pagar/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const saque = await prisma.transacao.findUnique({
      where: { id },
    });

    if (!saque) {
      return res.status(404).json({ error: "Saque não encontrado" });
    }

    if (saque.status === "paid") {
      return res.json({ ok: true, message: "Saque já estava pago" });
    }

    // Marca como pago
    await prisma.transacao.update({
      where: { id },
      data: { status: "paid" },
    });

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
  } catch (error) {
    console.error("Erro ao pagar saque:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;