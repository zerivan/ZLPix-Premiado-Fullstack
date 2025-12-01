import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// Função que converte BigInt para string (recursivamente)
const serialize = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (typeof data === "bigint") return data.toString();
  if (Array.isArray(data)) return data.map(serialize);
  if (typeof data === "object") {
    return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, serialize(v)]));
  }
  return data;
};

// ------------------------
//  REGISTER (cadastro)
// ------------------------
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, e-mail e senha são obrigatórios." });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "E-mail já está cadastrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { name, email, phone, pixKey, passwordHash },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: serialize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário.", error: String(err) });
  }
});

// ------------------------
//  LOGIN
// ------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign({ sub: user.id.toString(), email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      user: serialize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/login:", err);
    return res.status(500).json({ message: "Erro ao fazer login.", error: String(err) });
  }
});

export default router;