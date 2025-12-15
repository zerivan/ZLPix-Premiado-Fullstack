import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// ======================================
// 🔧 SERIALIZADOR PARA BIGINT DO PRISMA
// ======================================
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

// ======================================
// 🔒 SANITIZAÇÃO (REMOVE passwordHash)
// ======================================
function sanitize(obj: any) {
  if (!obj) return obj;
  const s = serialize(obj);
  if (s && typeof s === "object" && "passwordHash" in s) {
    delete s.passwordHash;
  }
  return s;
}

// ======================================
// 👤 REGISTER USER
// ======================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios.",
      });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        message: "E-mail já está cadastrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        pixKey,
        passwordHash,
      },
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso.",
      user: sanitize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({
      message: "Erro ao cadastrar usuário.",
    });
  }
});

// ======================================
// 🔑 LOGIN USER
// ======================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-mail e senha são obrigatórios." });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user.id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login realizado com sucesso.",
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error("Erro em /auth/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login.",
    });
  }
});

// ======================================
// 🛡 LOGIN ADMIN
// ======================================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admins.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Admin não encontrado." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const token = jwt.sign(
      { email: admin.email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login admin realizado com sucesso.",
      token,
      admin: sanitize(admin),
    });
  } catch (err) {
    console.error("Erro em /auth/admin/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login admin.",
    });
  }
});

// ======================================
// 🔐 RECUPERAR SENHA — SOLICITA TOKEN
// ======================================
router.post("/recover", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-mail é obrigatório." });
    }

    const user = await prisma.users.findUnique({ where: { email } });

    // Sempre responde ok (segurança)
    if (!user) {
      return res.json({
        message:
          "Se este e-mail estiver cadastrado, enviaremos instruções.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

    await prisma.password_reset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // 🚧 Por enquanto apenas log
    console.log("🔐 LINK RECUPERAÇÃO:", {
      email,
      link: `${process.env.FRONT_URL}/nova-senha?token=${token}`,
    });

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

// ======================================
// 🔁 RESETAR SENHA — CONFIRMA TOKEN
// ======================================
router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token e nova senha são obrigatórios." });
    }

    const reset = await prisma.password_reset.findUnique({
      where: { token },
    });

    if (
      !reset ||
      reset.used ||
      reset.expiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Token inválido ou expirado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    await prisma.password_reset.update({
      where: { id: reset.id },
      data: { used: true },
    });

    return res.json({
      message: "Senha redefinida com sucesso.",
    });
  } catch (err) {
    console.error("Erro em /auth/reset:", err);
    return res.status(500).json({
      message: "Erro ao redefinir senha.",
    });
  }
});

export default router;