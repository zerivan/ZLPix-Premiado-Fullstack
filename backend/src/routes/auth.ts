import { Router } from "express";
import bcrypt from "bcryptjs"; // ✅ compatível com Render
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// ===============================
// Utils
// ===============================
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

// ===============================
// USER REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Dados obrigatórios." });
    }

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { name, email, phone, pixKey, passwordHash },
    });

    return res.json({ user: sanitize(user) });
  } catch {
    return res.status(500).json({ message: "Erro ao registrar usuário." });
  }
});

// ===============================
// USER LOGIN
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, role: "user" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, user: sanitize(user) });
  } catch {
    return res.status(500).json({ message: "Erro no login." });
  }
});

// ===============================
// ADMIN REGISTER (CHAVE DA SOLUÇÃO)
// ===============================
router.post("/admin/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({
        message: "Senha mínima de 8 caracteres.",
      });
    }

    const exists = await prisma.admins.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Admin já existe." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await prisma.admins.create({
      data: { email, passwordHash },
    });

    return res.json({ admin: sanitize(admin) });
  } catch {
    return res.status(500).json({ message: "Erro ao criar admin." });
  }
});

// ===============================
// ADMIN LOGIN
// ===============================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admins.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Admin não encontrado." });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      { id: admin.id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token });
  } catch {
    return res.status(500).json({ message: "Erro no login admin." });
  }
});

export default router;