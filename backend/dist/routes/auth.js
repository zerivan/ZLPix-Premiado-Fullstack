const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma.js");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// ========= SERIALIZA BIGINT =========
function serialize(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === "bigint") return data.toString();
  if (Array.isArray(data)) return data.map(serialize);
  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, serialize(v)])
    );
  }
  return data;
}

// =====================================
// 🔹 REGISTRO DE USUÁRIO NORMAL
// =====================================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, email e senha obrigatórios." });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
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
    console.error("Erro /auth/register:", err);
    res.status(500).json({ message: "Erro ao cadastrar usuário." });
  }
});

// =====================================
// 🔹 LOGIN USUÁRIO NORMAL
// =====================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Credenciais obrigatórias." });
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Credenciais inválidas." });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Credenciais inválidas." });

    const token = jwt.sign(
      { sub: user.id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login realizado.",
      token,
      user: serialize(user),
    });
  } catch (err) {
    console.error("Erro /auth/login:", err);
    res.status(500).json({ message: "Erro no login." });
  }
});

// =====================================
// 🔥 LOGIN ADMINISTRADOR
// =====================================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Credenciais obrigatórias." });
    }

    const admin = await prisma.admins.findUnique({ where: { email } });

    if (!admin) return res.status(401).json({ message: "Admin não encontrado." });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ message: "Senha incorreta." });

    const token = jwt.sign(
      { sub: admin.id.toString(), role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login admin OK.",
      token,
      admin: serialize(admin),
    });
  } catch (err) {
    console.error("Erro /auth/admin/login:", err);
    res.status(500).json({ message: "Erro ao logar admin." });
  }
});

module.exports = router;