/**
 * ============================
 * CRIAR BILHETE PAGANDO COM SALDO
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

    const wallet = await prisma.wallet.findFirst({ where: { userId } });
    if (!wallet || Number(wallet.saldo) < valor) {
      return res.status(400).json({ error: "Saldo insuficiente." });
    }

    const { status, sorteioData } = definirStatusBilhete();

    let bilheteCriado: any = null;
    let usuario: any = null;

    await prisma.$transaction(async (tx) => {
      await tx.transacao.create({
        data: {
          userId,
          valor,
          status: "completed",
          metadata: { tipo: "saida", origem: "aposta" },
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { saldo: { decrement: valor } },
      });

      bilheteCriado = await tx.bilhete.create({
        data: {
          userId,
          dezenas: dezenasStr,
          valor,
          pago: true,
          status,
          sorteioData,
        },
      });

      usuario = await tx.users.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
    });

    // 🔔 Push
    await enviarPushBilheteCriado(userId, bilheteCriado.id);

    // 📧 Email
    if (usuario?.email) {
      await enviarEmailBilheteCriado({
        email: usuario.email,
        nome: usuario.name,
        bilheteId: bilheteCriado.id,
        dezenas: dezenasStr,
        sorteioData,
      });
    }

    // ✅ RETORNO CORRETO PARA O FRONT (FECHA O PIX)
    return res.json({
      ok: true,
      status: "completed",
      bilheteId: bilheteCriado.id,
      redirect: "/meus-bilhetes",
    });
  } catch (e) {
    console.error("Erro ao pagar bilhete:", e);
    return res.status(500).json({ error: "Erro interno." });
  }
});