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

// 🔥 NOVO: RATE LIMIT LOGIN (MEMÓRIA)
const loginAttempts = new Map<
  string,
  { count: number; blockedUntil: number }
>();

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 60 * 1000;

function getKey(req: any, email: string) {
  return `${req.ip}-${email.toLowerCase()}`;
}

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
// 🔥 VALIDAÇÃO DE SENHA
// ============================
function validarSenha(password: string, email?: string) {
  if (!password || password.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres.";
  }

  if (email && password.toLowerCase() === email.toLowerCase()) {
    return "A senha não pode ser igual ao e-mail.";
  }

  if (!/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
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
      await resend.emails.send({
        from: "suporte@mail.zlpixpremiado.com.br",
        to: user.email,
        subject: "Recuperação de senha",
        html: `
<p>Olá, ${user.name}</p>

<p>Clique no botão abaixo para redefinir sua senha:</p>

<p>
  <a href="https://zlpix-premiado-site.onrender.com/reset?token=${token}" 
     style="display:inline-block;padding:12px 20px;background:#ffd700;color:#000;text-decoration:none;border-radius:8px;font-weight:bold;">
    Redefinir senha
  </a>
</p>

<p>Se o botão não funcionar, copie e cole o link abaixo no navegador:</p>

<p style="word-break:break-all;">
  https://zlpix-premiado-site.onrender.com/reset?token=${token}
</p>

<p>Esse link expira em 15 minutos.</p>
`,
      });
    } catch (emailError) {
      return res.status(500).json({
        message: "Erro ao enviar email.",
      });
    }

    return res.json({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções.",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao solicitar recuperação.",
    });
  }
});

// ============================
// 🔥 RESETAR SENHA
// ============================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token e senha são obrigatórios.",
      });
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({
        message: "Token inválido ou expirado.",
      });
    }

    const user = await prisma.users.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });
    }

    const erroSenha = validarSenha(password, user.email);
    if (erroSenha) {
      return res.status(400).json({ message: erroSenha });
    }

    const mesmaSenha = await bcrypt.compare(password, user.passwordHash);
    if (mesmaSenha) {
      return res.status(400).json({
        message: "A nova senha não pode ser igual à anterior.",
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
    return res.status(500).json({
      message: "Erro ao redefinir senha.",
    });
  }
});

// ============================
// 🔥 LOGIN USER
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const key = getKey(req, email);
    const now = Date.now();
    const attempt = loginAttempts.get(key);

    if (attempt && attempt.blockedUntil > now) {
      return res.status(429).json({
        message: "Muitas tentativas. Aguarde.",
      });
    }

    const user = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      const count = (attempt?.count || 0) + 1;

      loginAttempts.set(key, {
        count,
        blockedUntil: count >= MAX_TENTATIVAS ? now + BLOQUEIO_MS : 0,
      });

      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    loginAttempts.delete(key);

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
  } catch {
    return res.status(500).json({
      message: "Erro ao fazer login.",
    });
  }
});

// ============================
// 🔥 LOGIN ADMIN (RESTAURADO)
// ============================
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admins.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      {
        id: admin.id.toString(),
        email: admin.email,
        role: "admin",
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
        role: "admin",
      },
    });
  } catch {
    return res.status(500).json({
      message: "Erro ao fazer login admin.",
    });
  }
});

export default router;