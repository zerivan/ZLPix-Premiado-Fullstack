// backend/src/routes/users.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /users
 * Retorna lista de usuários (sem mostrar senha)
 */
router.get("/", async (_req, res) => {
  try {
    // ✅ Corrigido: prisma.user → prisma.users
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

    return res.json(users);
  } catch (err: any) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

export default router;