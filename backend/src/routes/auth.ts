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
// 🔥 VALIDAÇÃO DE SENHA (NOVO)
// ============================
function validarSenha(password: string, email?: string) {
  if (!password || password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }

  if (email && password.toLowerCase() === email.toLowerCase()) {
    return "A senha não pode ser igual ao e-mail.";
  }

  const temMaiuscula = /[A-Z]/.test(password);
  const temMinuscula = /[a-z]/.test(password);
  const temNumero = /[0-9]/.test(password);
  const temEspecial = /[^A-Za-z0-9]/.test(password);

  if (!temMaiuscula) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }

  if (!temMinuscula) {
    return "A senha deve conter pelo menos uma letra minúscula.";
  }

  if (!temNumero) {
    return "A senha deve conter pelo menos um número.";
  }

  if (!temEspecial) {
    return "A senha deve conter pelo menos um caractere especial.";
  }

  return null;
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
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    try {
      const result = await resend.emails.send({
        from: "suporte@mail.zlpixpremiado.com.br",
        to: user.email,
        subject: "Recuperação de senha",
        html: `
<p>Olá, ${user.name}</p>
<p>Clique no link abaixo para redefinir sua senha:</p>
<a href="https://zlpix-premiado-site.onrender.com/reset?token=${token}">
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
// 🔥 RESETAR SENHA (NOVO)
// ============================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token e senha são obrigatórios.",
      });
    }

    // 🔥 VALIDAÇÃO NOVA
    const erroSenha = validarSenha(password);
    if (erroSenha) {
      return res.status(400).json({ message: erroSenha });
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Token inválido ou expirado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.users.update({
      where: { id: decoded.id },
      data: { passwordHash },
    });

    return res.json({
      message: "Senha atualizada com sucesso.",
    });
  } catch (err) {
    console.error("Erro em /auth/reset-password:", err);
    return res.status(500).json({
      message: "Erro ao redefinir senha.",
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
    email = String(email).trim().toLowerCase();
    phone = phone ? String(phone).trim() : null;
    pixKey = pixKey ? String(pixKey).trim() : null;

    const existing = await prisma.users.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({
        message: "E-mail já está cadastrado.",
      });
    }

    // 🔥 VALIDAÇÃO NOVA
    const erroSenha = validarSenha(password, email);
    if (erroSenha) {
      return res.status(400).json({ message: erroSenha });
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
      error: String(err),
    });
  }
});

// ============================
// LOGIN USER
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      {
        id: user.id.toString(),
        email: user.email,
      },
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
      error: String(err),
    });
  }
});

// ============================
// LOGIN ADMIN
// ============================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios.",
      });
    }

    const normalizedEmail = String(email).toLowerCase();

    const admin = await prisma.admins.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return res.status(401).json({ message: "Admin não encontrado." });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);

    if (!valid) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const role =
      normalizedEmail === "master@zlpix.com" ? "master" : "admin";

    const token = jwt.sign(
      {
        id: admin.id.toString(),
        email: admin.email,
        role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login admin realizado com sucesso.",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role,
      },
    });
  } catch (err) {
    console.error("Erro em /auth/admin/login:", err);
    return res.status(500).json({
      message: "Erro ao fazer login admin.",
      error: String(err),
    });
  }
});

export default router;