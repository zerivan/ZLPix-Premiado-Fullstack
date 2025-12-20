import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

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
    return res.status(401).json({
      ok: false,
      error: "Token de administrador ausente",
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: "Token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return res.status(403).json({
        ok: false,
        error: "Acesso restrito ao administrador",
      });
    }

    req.adminId = decoded.id;
    next();
  } catch {
    return res.status(401).json({
      ok: false,
      error: "Token expirado ou inválido",
    });
  }
}

// =====================================================
// EXPORT DEFAULT (NECESSÁRIO PARA server.ts)
// =====================================================
export default router;
