import { Router } from "express";
import { prisma } from "../lib/prisma";
import admin from "firebase-admin";
import nodemailer from "nodemailer";

const router = Router();

/**
 * ============================
 * TIPAGEM DA FEDERAL
 * ============================
 */
type FederalResponse = {
  ok: boolean;
  data?: {
    dataApuracao: string;
    premios: string[];
    proximoSorteio?: string;
    timestampProximoSorteio?: number;
  };
};

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
        `${process.env.BACKEND_URL || "http://localhost:4000"
