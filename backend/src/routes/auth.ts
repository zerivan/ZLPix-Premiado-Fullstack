// backend/src/routes/auth.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

// em produção você coloca isso no .env
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-zlpix-change-me";

/* ============================================================
   POST /auth/register  → criar conta
============================================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    // verifica duplicado
    const exists = await prisma.user.findUnique({ where: { email } });

    if (exists) {
      return res.status(409).json({
        message: "Já existe um usuário com esse e-mail.",
      });
    }

    // hash seguro
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        pixKey,
        passwordHash,
      },
    });

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({ message: "Erro ao criar conta." });
  }
});

/* ============================================================
   POST /auth/login  → autenticar usuário
============================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({
        message: "E-mail ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("Erro em /auth/login:", err);
    return res.status(500).json({ message: "Erro ao fazer login." });
  }
});

export default router;