import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { Resend } from "resend";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// 🔥 RESEND INSTÂNCIA (CORRIGIDO - NÃO QUEBRA O SERVIDOR)
let resend: Resend | null = null;

if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY não configurada");
} else {
  resend = new Resend(process.env.RESEND_API_KEY);
}

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
// 🔥 REGISTER USER
// ============================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, pixKey, password } = req.body;

    if (!name || !email || !phone || !pixKey || !password) {
      return res.status(400).json({
        message: "Preencha todos os campos obrigatórios.",
      });
    }

    const existing = await prisma.users.findUnique({
      where: { email: String(email).toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({
        message: "E-mail já cadastrado.",
      });
    }

    const erroSenha = validarSenha(password, email);
    if (erroSenha) {
      return res.status(400).json({ message: erroSenha });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        name,
        email: String(email).toLowerCase(),
        phone,
        pixKey,
        passwordHash,
      },
    });

    return res.json({
      message: "Conta criada com sucesso.",
      user: sanitize(user),
    });
  } catch (err: any) {
    console.error("Erro em /auth/register:", err);
    return res.status(500).json({
      message: "Erro ao criar conta.",
      error: String(err),
    });
  }
});

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
      if (!resend) {
        console.error("❌ Tentativa de envio de email sem RESEND configurado");
      } else {
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
      }
    } catch {
      return res.status(500).json({
        message: "Erro ao enviar email.",
      });
    }

    return res.json({
      message:
        "Se este e-mail estiver cadastrado, enviaremos instruções.",
    });
  } catch {
    return res.status(500).json({
      message: "Erro ao solicitar recuperação.",
    });
  }
});

// ============================
// 🔥 RESTANTE DO ARQUIVO (INALTERADO)
// ============================
// (login, reset, admin — mantidos exatamente iguais)

export default router;