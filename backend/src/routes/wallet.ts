/**
 * =========================
 * POST /wallet/saque/pagar
 * =========================
 * ADMIN marca saque como PAGO
 */
router.post("/saque/pagar", async (req, res) => {
  try {
    const { transacaoId } = req.body;

    if (!transacaoId) {
      return res.status(400).json({ error: "transacaoId obrigatório" });
    }

    const saque = await prisma.transacao.findUnique({
      where: { id: Number(transacaoId) },
    });

    if (!saque || saque.metadata?.tipo !== "saque") {
      return res.status(404).json({ error: "Saque não encontrado" });
    }

    await prisma.transacao.update({
      where: { id: Number(transacaoId) },
      data: { status: "paid" },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Erro wallet/saque/pagar:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});