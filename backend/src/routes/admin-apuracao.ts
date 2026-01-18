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
        `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
      );

      const json = (await resp.json()) as FederalResponse;

      if (!json.ok || !Array.isArray(json.data?.premios)) {
        return res
          .status(400)
          .json({ error: "Não foi possível obter resultado da Federal." });
      }

      premiosFederal = json.data.premios;
    }

    if (!Array.isArray(premiosFederal) || premiosFederal.length !== 5) {
      return res.status(400).json({ error: "Resultado da Federal inválido." });
    }

    /**
     * ============================
     * MONTA DEZENAS PREMIADAS
     * ============================
     */
    const dezenasPremiadas: string[] = [];
    premiosFederal.forEach((num: string) => {
      dezenasPremiadas.push(num.slice(0, 2));
      dezenasPremiadas.push(num.slice(-2));
    });

    /**
     * ============================
     * BUSCA BILHETES VÁLIDOS
     * ============================
     */
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

    /**
     * ============================
     * PRÊMIO ATUAL
     * ============================
     */
    const PREMIO_BASE = 500;
    let premioAtual = PREMIO_BASE;

    const premioRow = await prisma.appContent.findUnique({
      where: { key: "premio_atual" },
    });

    if (premioRow) {
      premioAtual = Number(premioRow.contentHtml);
    }

    /**
     * ============================
     * SEM GANHADORES → ACUMULA
     * ============================
     */
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

    /**
     * ============================
     * DISTRIBUI PRÊMIO
     * ============================
     */
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
