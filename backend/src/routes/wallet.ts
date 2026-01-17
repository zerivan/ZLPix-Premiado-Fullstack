/**
 * =========================
 * GET /wallet/historico/download
 * =========================
 * 📥 Download do histórico da carteira (CSV)
 * - Últimos 40 dias
 */
router.get("/historico/download", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    // 📆 Limite de 40 dias
    const limite = new Date();
    limite.setDate(limite.getDate() - 40);

    const transacoes = await prisma.transacao.findMany({
      where: {
        userId,
        createdAt: { gte: limite },
        OR: [
          { metadata: { path: ["tipo"], equals: "deposito" } },
          { metadata: { path: ["tipo"], equals: "saque" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        createdAt: true,
        valor: true,
        status: true,
        metadata: true,
      },
    });

    // 🧾 Cabeçalho CSV
    let csv =
      "Data,Tipo,Valor,Status,Chave PIX\n";

    for (const t of transacoes) {
      const meta: any = t.metadata || {};
      const tipo =
        meta.tipo === "saque" ? "Saque" : "Depósito";

      const pixKey =
        meta.pixKey ? `"${meta.pixKey}"` : "";

      csv +=
        `"${new Date(t.createdAt).toLocaleString("pt-BR")}",` +
        `"${tipo}",` +
        `"${Number(t.valor).toFixed(2)}",` +
        `"${t.status}",` +
        `${pixKey}\n`;
    }

    // 📤 Headers para download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=historico-carteira-zlpix.csv"
    );

    return res.send(csv);
  } catch (err) {
    console.error("Erro download histórico:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});