// backend/src/routes/users.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /users
 * Retorna lista de usuários (sem mostrar senha)
 */
router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        pixKey: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (err: any) {
    console.error("Erro ao listar usuários:", err);
    return res.status(500).json({ message: "Erro ao buscar usuários." });
  }
});

export default router;