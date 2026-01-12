import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";

const router = Router();

/**
 * ============================
 * FIREBASE ADMIN (BACKEND)
 * ============================
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * =====================================================
 * CONFIGURAÇÃO DO PRÊMIO
 * =====================================================
 */
const PREMIO_BASE = 500;

/**
 * Próxima quarta-feira às 20h
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
 * =====================================================
 * PUSH — BILHETE PREMIADO
 * =====================================================
 */
async function enviarPushBilhetePremiado(
  userId: number,
  bilheteId: number,
  premio: number
) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: {
        title: "🎉 PARABÉNS! BILHETE PREMIADO!",
        body: `Seu bilhete #${bilheteId} foi premiado. Valor: R$ ${premio.toFixed(
          2
        )}`,
      },
      data: {
        url: "/meus-bilhetes",
      },
    });
  } catch (e) {
    console.error("Erro ao enviar push premiado:", e);
  }
}

/**
 * =====================================================
 * API — PRÊMIO ATUAL (HOME / APP)
 * =====================================================
 */
router.get("/premio-atual", async (_req, res) => {
  try {
    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    const premioAtual = premioRow
      ? Number(premioRow.contentHtml)
      : PREMIO_BASE;

    const proximoSorteio = proximaQuarta();

    return res.json({
      ok: true,
      data: {
        premioAtual,
        proximoSorteio: proximoSorteio.toISOString(),
        timestampProximoSorteio: proximoSorteio.getTime(),
      },
    });
  } catch (error) {
    console.error("Erro prêmio atual:", error);
    return res.status(500).json({ ok: false });
  }
});

/**
 * =====================================================
 * ADMIN — APURAR SORTEIO
 * =====================================================
 */
router.post("/apurar", async (req, res) => {
  try {
    const { premiosFederal } = req.body;

    if (!Array.isArray(premiosFederal) || premiosFederal.length !== 5) {
      return res.status(400).json({ error: "Resultado da Federal inválido." });
    }

    const dezenasPremiadas: string[] = [];

    premiosFederal.forEach((num) => {
      dezenasPremiadas.push(num.slice(0, 2));
      dezenasPremiadas.push(num.slice(-2));
    });

    const bilhetes = await prisma.bilhete.findMany({
      where: {
        pago: true,
        status: "ATIVO_ATUAL",
      },
    });

    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas.split(",");
      const acertos = dezenasBilhete.filter((d) =>
        dezenasPremiadas.includes(d)
      );
      return acertos.length >= 3;
    });

    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    let premioAtual = premioRow
      ? Number(premioRow.contentHtml)
      : PREMIO_BASE;

    if (ganhadores.length === 0) {
      premioAtual += PREMIO_BASE;

      await prisma.appContent.upsert({
        where: { key: "premio_atual" },
        update: { contentHtml: String(premioAtual) },
        create: {
          key: "premio_atual",
          title: "Prêmio Atual",
          contentHtml: String(premioAtual),
        },
      });

      return res.json({
        ok: true,
        mensagem: "Nenhum ganhador. Prêmio acumulado.",
        premioAtual,
      });
    }

    const valorPorBilhete = premioAtual / ganhadores.length;

    for (const b of ganhadores) {
      await prisma.bilhete.update({
        where: { id: b.id },
        data: {
          status: "PREMIADO",
          premioValor: valorPorBilhete,
          resultadoFederal: premiosFederal.join(","),
          apuradoEm: new Date(),
        },
      });

      // 🔔 PUSH — BILHETE PREMIADO
      await enviarPushBilhetePremiado(
        b.userId,
        b.id,
        valorPorBilhete
      );
    }

    await prisma.appContent.upsert({
      where: { key: "premio_atual" },
      update: { contentHtml: String(PREMIO_BASE) },
      create: {
        key: "premio_atual",
        title: "Prêmio Atual",
        contentHtml: String(PREMIO_BASE),
      },
    });

    return res.json({
      ok: true,
      ganhadores: ganhadores.length,
      valorPorBilhete,
      proximoPremio: PREMIO_BASE,
    });
  } catch (error) {
    console.error("Erro apuração:", error);
    return res.status(500).json({ error: "Erro ao apurar sorteio." });
  }
});

export default router;