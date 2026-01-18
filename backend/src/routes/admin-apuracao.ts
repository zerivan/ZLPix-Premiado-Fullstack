import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

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
 * ============================
 * EMAIL — CONFIGURAÇÃO SMTP
 * ============================
 */
const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * =====================================================
 * EMAIL — BILHETE PREMIADO
 * =====================================================
 */
async function enviarEmailBilhetePremiado(params: {
  email: string;
  nome?: string | null;
  bilheteId: number;
  premio: number;
}) {
  if (!params.email) return;

  const link = `${process.env.FRONTEND_URL}/meus-bilhetes`;

  const html = `
    <p>🎉 <strong>PARABÉNS ${params.nome || ""}!</strong></p>
    <p>Seu bilhete foi <strong>PREMIADO</strong> no ZLPix 🎟️</p>
    <p>
      <strong>Bilhete:</strong> #${params.bilheteId}<br/>
      <strong>Prêmio:</strong> R$ ${params.premio.toFixed(2)}
    </p>
    <p>👉 <a href="${link}">Ver meus bilhetes</a></p>
    <p>ZLPix Premiado</p>
  `;

  try {
    await mailTransporter.sendMail({
      from: `"ZLPix Premiado" <${process.env.SMTP_FROM}>`,
      to: params.email,
      subject: "🎉 Parabéns! Seu bilhete foi PREMIADO",
      html,
    });
  } catch (err) {
    console.error("Erro ao enviar email premiado:", err);
  }
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
      data: { url: "/meus-bilhetes" },
    });
  } catch (e) {
    console.error("Erro ao enviar push premiado:", e);
  }
}

/**
 * =====================================================
 * CONFIGURAÇÃO DO PRÊMIO
 * =====================================================
 */
const PREMIO_BASE = 500;

/**
 * =====================================================
 * ADMIN — APURAR SORTEIO
 * =====================================================
 */
router.post("/apurar", async (req, res) => {
  try {
    let { premiosFederal } = req.body;

    /**
     * 🔥 SE NÃO VEIO RESULTADO → BUSCA NA FEDERAL
     */
    if (!Array.isArray(premiosFederal)) {
      const resp = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
      );
      const json = await resp.json();

      if (!json?.ok || !Array.isArray(json.data?.premios)) {
        return res
          .status(400)
          .json({ error: "Não foi possível obter resultado da Federal." });
      }

      premiosFederal = json.data.premios;
    }

    if (!Array.isArray(premiosFederal) || premiosFederal.length !== 5) {
      return res.status(400).json({ error: "Resultado da Federal inválido." });
    }

    const dezenasPremiadas: string[] = [];
    premiosFederal.forEach((num: string) => {
      dezenasPremiadas.push(num.slice(0, 2));
      dezenasPremiadas.push(num.slice(-2));
    });

    const bilhetes = await prisma.bilhete.findMany({
      where: { pago: true, status: "ATIVO_ATUAL" },
    });

    const ganhadores = bilhetes.filter((b) => {
      const dezenasBilhete = b.dezenas.split(",");
      const acertos = dezenasBilhete.filter((d) =>
        dezenasPremiadas.includes(d)
      );
      return acertos.length >= 3;
    });

    let premioAtual = PREMIO_BASE;
    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });
    if (premioRow) premioAtual = Number(premioRow.contentHtml);

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

      await enviarPushBilhetePremiado(
        b.userId,
        b.id,
        valorPorBilhete
      );

      const user = await prisma.users.findUnique({
        where: { id: b.userId },
        select: { email: true, name: true },
      });

      if (user?.email) {
        await enviarEmailBilhetePremiado({
          email: user.email,
          nome: user.name,
          bilheteId: b.id,
          premio: valorPorBilhete,
        });
      }
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