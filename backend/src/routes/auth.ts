import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "zlpix-fallback-secret";

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      }
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token
    });
  } catch (err) {
    console.error("Erro em /auth/login:", err);
    return res.status(500).json({ message: "Erro ao fazer login." });
  }
});

export default router;
