import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const router = Router();

/**
 * ============================
 * FIREBASE ADMIN
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
 * EMAIL — SMTP
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
 * ============================
 * PUSH — SALVAR TOKEN
 * ============================
 */
router.post("/push/token", async (req, res) => {
  try {
    const { token, userId } = req.body;

    if (!token || !userId) {
      return res.status(400).json({ error: "Token ou userId ausente." });
    }

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { token, userId },
    });

    return res.json({ ok: true });
  } catch (e) {
    console.error("Erro ao salvar token push:", e);
    return res.status(500).json({ error: "Erro interno." });
  }
});

/**
 * ============================
 * PUSH — BILHETE CRIADO
 * ============================
 */
async function enviarPushBilheteCriado(userId: number, bilheteId: number) {
  const tokens = await prisma.pushToken.findMany({ where: { userId } });
  if (tokens.length === 0) return;

  await admin.messaging().sendEachForMulticast({
    tokens: tokens.map((t) => t.token),
    notification: {
      title: "🎟️ Bilhete gerado!",
      body: `Seu bilhete #${bilheteId} já está disponível.`,
    },
    data: { url: "/meus-bilhetes" },
  });
}

/**
 * ============================
 * EMAIL — BILHETE CRIADO
 * ============================
 */
async function enviarEmailBilheteCriado(params: {
  email: string;
  nome?: string | null;
  bilheteId: number;
  dezenas: string;
  sorteioData: Date;
}) {
  const html = `
    <p>Olá ${params.nome || ""},</p>
    <p>Seu bilhete foi gerado com sucesso 🎟️</p>
    <p><strong>Bilhete:</strong> #${params.bilheteId}</p>
    <p><strong>Dezenas:</strong> ${params.dezenas}</p>
    <p><strong>Sorteio:</strong> ${params.sorteioData.toLocaleDateString("pt-BR")}</p>
    <p><a href="${process.env.FRONTEND_URL}/meus-bilhetes">Ver bilhetes</a></p>
  `;

  await mailTransporter.sendMail({
    from: `"ZLPix Premiado" <${process.env.SMTP_FROM}>`,
    to: params.email,
    subject: "🎟️ Bilhete gerado",
    html,
  });
}

/**
 * ============================
 * REGRA — QUARTA / 17H
 * ============================
 */
function proximaQuarta(): Date {
  const now = new Date();
  const diff = (3 - now.getDay() + 7) % 7 || 7;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  d.setHours(20, 0, 0, 0);
  return d;
}

function quartaAtualOuProxima(): Date {
  const now = new Date();
  if (now.getDay() === 3 && now.getHours() < 20) {
    const d = new Date(now);
    d.setHours(20, 0, 0, 0);
    return d;
  }
  return proximaQuarta();
}

function definirStatusBilhete() {
  const now = new Date();
  if (now.getDay() === 3 && now.getHours() >= 17) {
    return { status: "ATIVO_PROXIMO", sorteioData: proximaQuarta() };
  }
  return { status: "ATIVO_ATUAL", sorteioData: quartaAtualOuProxima() };
}

/**
 * ============================
 * LISTAR BILHETES
 * ============================
 */
router.get("/listar/:userId", async (req, res) => {
  const userId = Number(req.params.userId);
  const bilhetes = await prisma.bilhete.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ bilhetes });
});

/**
 * ============================
 * PAGAR COM SALDO
 * ============================
 */
router.post("/pagar-com-saldo", async (req, res) => {
  const { userId, dezenas, valorTotal } = req.body;
  const valor = Number(valorTotal) || 2;

  const wallet = await prisma.wallet.findFirst({ where: { userId } });
  if (!wallet || Number(wallet.saldo) < valor) {
    return res.status(400).json({ error: "Saldo insuficiente." });
  }

  const { status, sorteioData } = definirStatusBilhete();
  const dezenasStr = dezenas.join(",");

  const bilhete = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { saldo: { decrement: valor } },
    });

    return tx.bilhete.create({
      data: {
        userId,
        dezenas: dezenasStr,
        valor,
        pago: true,
        status,
        sorteioData,
      },
    });
  });

  await enviarPushBilheteCriado(userId, bilhete.id);

  res.json({ ok: true });
});

export default router;