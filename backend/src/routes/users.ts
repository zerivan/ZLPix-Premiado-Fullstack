// backend/src/routes/users.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * Converte BigInt → string sem quebrar JSON
 */
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

/**
 * GET /users
 * Retorna lista de usuários (sem passwordHash)
 */
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pixKey: true,
        createdAt: true,
      },
    });

    return res.json(serialize(users)); // ✔ BigInt seguro
  } catch (err: any) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

export default router;