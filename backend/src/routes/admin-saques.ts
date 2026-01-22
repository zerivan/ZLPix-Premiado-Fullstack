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
  const saques = await prisma.transacao.findMany({
    where: {
      status: "pending",
      metadata: {
        path: ["tipo"],
        equals: "saque",
      },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(saques);
});

/**
 * ============================
 * CONFIRMAR PAGAMENTO DO SAQUE
 * ============================
 * ADMIN confirma que pagou o PIX
 */
router.post("/:id/pagar", async (req, res) => {
  const id = Number(req.params.id);

  console.log(`💰 Admin confirmando pagamento de saque: id: ${id}`);

  const saque = await prisma.transacao.findUnique({
    where: { id },
  });

  if (!saque) {
    console.warn(`⚠️ Saque não encontrado: id: ${id}`);
    return res.status(404).json({ error: "Saque não encontrado" });
  }

  if (saque.status === "paid") {
    console.log(`ℹ️ Saque já estava pago: id: ${id}`);
    return res.json({ ok: true });
  }

  // 🔐 GARANTE CARTEIRA
  const wallet = await prisma.wallet.findFirst({
    where: { userId: saque.userId },
  });

  if (!wallet || Number(wallet.saldo) < Number(saque.valor)) {
    console.warn(`⚠️ Saldo insuficiente para concluir saque: userId: ${saque.userId}, saldo: ${wallet?.saldo ?? 0}, valor: ${saque.valor}`);
    return res.status(400).json({
      error: "Saldo insuficiente para concluir saque",
    });
  }

  console.log(`✅ Processando saque: userId: ${saque.userId}, valor: R$ ${Number(saque.valor).toFixed(2)}`);

  await prisma.$transaction([
    // 💳 DEBITA CARTEIRA (CORREÇÃO AQUI)
    prisma.wallet.updateMany({
      where: { userId: saque.userId },
      data: {
        saldo: {
          decrement: Number(saque.valor),
        },
      },
    }),

    // 📄 MARCA SAQUE COMO PAGO
    prisma.transacao.update({
      where: { id: saque.id },
      data: {
        status: "paid",
        metadata: {
          ...(saque.metadata as any),
          pagoEm: new Date().toISOString(),
        },
      },
    }),
  ]);

  // 🔔 NOTIFICA USUÁRIO
  console.log(`📢 Disparando notificação de saque pago para userId: ${saque.userId}`);
  await notify({
    type: "SAQUE_PAGO",
    userId: String(saque.userId),
    valor: Number(saque.valor),
  });

  console.log(`✅ Saque confirmado e notificação enviada: id: ${id}`);

  return res.json({ ok: true });
});

export default router;