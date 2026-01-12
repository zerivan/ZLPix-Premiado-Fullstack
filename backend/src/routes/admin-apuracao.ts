import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const router = Router();

/**
 * FIREBASE ADMIN (OPCIONAL)
 * Backend NÃO pode quebrar se não existir credencial
 */
let firebaseAtivo = false;

function initFirebaseAdmin() {
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    console.warn("Firebase Admin desativado (credenciais ausentes).");
    return;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  firebaseAtivo = true;
}

initFirebaseAdmin();

/**
 * EMAIL — CONFIGURAÇÃO SMTP
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
 * EMAIL — BILHETE PREMIADO
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
    <p><strong>Parabéns ${params.nome || ""}</strong></p>
    <p>Seu bilhete foi premiado.</p>
    <p>
      Bilhete: #${params.bilheteId}<br/>
      Prêmio: R$ ${params.premio.toFixed(2)}
    </p>
    <p><a href="${link}">Ver meus bilhetes</a></p>
    <p>ZLPix Premiado</p>
  `;

  try {
    await mailTransporter.sendMail({
      from: `"ZLPix Premiado" <${process.env.SMTP_FROM}>`,
      to: params.email,
      subject: "Bilhete premiado - ZLPix",
      html,
    });
  } catch (err) {
    console.error("Erro ao enviar email premiado:", err);
  }
}

/**
 * PUSH — BILHETE PREMIADO (SÓ SE FIREBASE ATIVO)
 */
async function enviarPushBilhetePremiado(
  userId: number,
  bilheteId: number,
  premio: number
) {
  if (!firebaseAtivo) return;

  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: {
        title: "Bilhete premiado",
        body: `Bilhete #${bilheteId} premiado. Valor R$ ${premio.toFixed(2)}`,
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
 * CONFIGURAÇÃO DO PRÊMIO
 */
const PREMIO_BASE = 500;

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
 * ADMIN — APURAR SORTEIO
 */
router.post("/apurar", async (req, res) => {
  try {
    const { premiosFederal } = req.body;

    if (!Array.isArray(premiosFederal) || premiosFederal.length !== 5) {
      return res.status(400).json({ error: "Resultado inválido." });
    }

    const dezenasPremiadas: string[] = [];
    premiosFederal.forEach((n) => {
      dezenasPremiadas.push(n.slice(0, 2), n.slice(-2));
    });

    const bilhetes = await prisma.bilhete.findMany({
      where: { pago: true, status: "ATIVO_ATUAL" },
    });

    const ganhadores = bilhetes.filter((b) => {
      const dezenas = b.dezenas.split(",");
      return dezenas.filter((d) => dezenasPremiadas.includes(d)).length >= 3;
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

      return res.json({ ok: true, premioAtual });
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

      await enviarPushBilhetePremiado(b.userId, b.id, valorPorBilhete);

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
    });
  } catch (error) {
    console.error("Erro apuração:", error);
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;