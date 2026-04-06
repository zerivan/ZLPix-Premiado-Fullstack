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
// 🔥 RECUPERAR SENHA
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
      JWT_SECRET