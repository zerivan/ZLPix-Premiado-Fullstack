import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AdminRequest extends Request {
  adminEmail?: string;
}

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

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      error: "Formato de token inválido",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // ✅ VALIDAÇÃO AJUSTADA (admin e master)
    if (
      !decoded.email ||
      (decoded.role !== "admin" && decoded.role !== "master")
    ) {
      return res.status(401).json({
        ok: false,
        error: "Token não autorizado",
      });
    }

    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      error: "Token expirado ou inválido",
    });
  }
}