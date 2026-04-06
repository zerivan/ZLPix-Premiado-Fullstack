import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Resend } from "resend";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// 🔥 RESEND INSTÂNCIA (COM VALIDAÇÃO)
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY não configurada");
}
const resend = new Resend(process.env.RESEND_API_KEY);

function serialize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (Array.isArray(obj)) return obj.map(serialize);
  if (typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, serialize(v)])
    );
  }
  return obj;
}

function sanitize(obj: any) {
  if (!obj) return obj;
  const s = serialize(obj);
  if (s && typeof s === "object" && "passwordHash" in s) {
    delete s.passwordHash;
  }
  return s;
}

// ============================
// 🔥 RECUPERAR SENHA (CORRIGIDO)
// ============================
router.post("/recover", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "E-mail é obrigatório.",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return res.json({
        message:
          "Se este e-mail estiver cadastrado, enviaremos instruções.",
      });
    }

    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // 🔥 ENVIO COM DEBUG CONTROLADO
    try {
      const result = await resend.emails.send({
        from: "onboarding@resend.dev", // 🔥 fix sender
        to: user.email,
        subject: "Recuperação de senha",
        html: `
          <p>Olá, ${user.name}</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="https://zlpix-premiado-fullstack.onrender.com/reset?token=${token}">
            Recuperar senha
          </a>
          <p>Esse link expira em 15 minutos.</p>
        `,
      });

      console.log("📨 RESEND RESULT:", result);
    } catch (emailError) {
      console.error("❌ ERRO AO ENVIAR EMAIL:", emailError);
      return res.status(500).json({
        message: "Erro ao enviar email.",
      });
    }

    return res.json({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções.",
    });
  } catch (err) {
    console.error("Erro em /auth/recover:", err);
    return res.status(500).json({
      message: "Erro ao solicitar recuperação.",
    });
  }
});

// ============================
// REGISTER USER
// ============================
router.post("/register", async (req, res) => {
  try {
    let { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    name = String(name).trim();