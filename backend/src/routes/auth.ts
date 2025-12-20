import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

// =====================================================
// LOGIN USUÁRIO
// =====================================================
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Dados inválidos" });
  }

  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Usuário não encontrado" });
  }

  const senhaOk = await bcrypt.compare(password, user.passwordHash);

  if (!senhaOk) {
    return res.status(401).json({ message: "Senha incorreta" });
  }

  const token = jwt.sign(
    { id: user.id, role: "user" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      nome: user.nome,
    },
  });
});

// =====================================================
// CADASTRO USUÁRIO
// =====================================================
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, nome } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Dados inválidos" });
  }

  const existe = await prisma.users.findUnique({
    where: { email },
  });

  if (existe) {
    return res.status(400).json({ message: "E-mail já cadastrado" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      email,
      nome,
      passwordHash: hash,
    },
  });

  return res.json({ ok: true, user });
});

// =====================================================
// TIPAGEM ADMIN
// =====================================================
export interface AdminRequest extends Request {
  adminId?: number;
}

// =====================================================
// MIDDLEWARE — AUTH ADMIN
// =====================================================
export function adminAuth(
  req: AdminRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ ok: false, error: "Token ausente" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return res.status(403).json({ ok: false, error: "Acesso negado" });
    }

    req.adminId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Token inválido" });
  }
}

export default router;