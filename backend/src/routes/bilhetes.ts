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
 * LISTAR BILHETES — APP (ROTA CORRETA)
 * ============================
 * Front envia: header x-user-id
 */
router.get("/meus", async (req, res) => {
  try {
    const userId = Number(req.headers["x-user-id"]);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não identificado" });
    }

    const bilhetes = await prisma.bilhete.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(bilhetes);
  } catch (err) {
    console.error("Erro listar bilhetes:", err);
    return res.status(500).json({ error: "Erro interno" });
  }
});

/**
 * ============================
 * LISTAR BILHETES — LEGADO / DEBUG
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

  const now = new Date();
  const sorteioData = now;

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
        sorteioData,
      },
    });
  });

  res.json({ ok: true, bilheteId: bilhete.id });
});

export default router;