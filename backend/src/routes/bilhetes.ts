import express from "express";
import { prisma } from "../lib/prisma";
import nodemailer from "nodemailer";
import admin from "firebase-admin";

const router = express.Router();

/**
 * FIREBASE ADMIN (OPCIONAL)
 * Não pode derrubar o servidor
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
 * PUSH — SALVAR TOKEN
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
 * PUSH — ENVIAR (somente se Firebase ativo)
 */
async function enviarPushBilheteCriado(userId: number, bilheteId: number) {
  if (!firebaseAtivo) return;

  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      tokens: tokens.map((t) => t.token),
      notification: {
        title: "Bilhete gerado",
        body: `Seu bilhete #${bilheteId} foi gerado.`,
      },
      data: {
        url: "/meus-bilhetes",
      },
    });
  } catch (e) {
    console.error("Erro ao enviar push:", e);
  }
}

/**
 * EMAIL — ENVIO
 */
async function enviarEmailBilheteCriado(params: {
  email: string;
  nome?: string | null;
  bilheteId: number;
  dezenas: string;
  sorteioData: Date;
}) {
  if (!params.email) return;

  const link = `${process.env.FRONTEND_URL}/meus-bilhetes`;

  const html = `
    <p>Olá ${params.nome || ""},</p>
    <p>Seu bilhete foi gerado com sucesso.</p>
    <p>
      Bilhete: #${params.bilheteId}<br/>
      Dezenas: ${params.dezenas}<br/>
      Sorteio: ${params.sorteioData.toLocaleDateString("pt-BR")}
    </p>
    <p><a href="${link}">Ver meus bilhetes</a></p>
    <p>ZLPix Premiado</p>
  `;

  try {
    await mailTransporter.sendMail({
      from: `"ZLPix Premiado" <${process.env.SMTP_FROM}>`,
      to: params.email,
      subject: "Bilhete gerado - ZLPix",
      html,
    });
  } catch (err) {
    console.error("Erro ao enviar email:", err);
  }
}

/**
 * CRIAR BILHETE PAGANDO COM SALDO
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
          status: "ATIVO_ATUAL",
          sorteioData: new Date(),
        },
      });

      usuario = await tx.users.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
    });

    await enviarPushBilheteCriado(userId, bilheteCriado.id);

    if (usuario?.email) {
      await enviarEmailBilheteCriado({
        email: usuario.email,
        nome: usuario.name,
        bilheteId: bilheteCriado.id,
        dezenas: dezenasStr,
        sorteioData: new Date(),
      });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error("Erro ao pagar bilhete:", e);
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;