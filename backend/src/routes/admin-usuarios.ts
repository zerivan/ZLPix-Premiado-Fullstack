import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — LISTAR USUÁRIOS DO SITE
 * =====================================================
 * Lê DIRETO da tabela users
 * NÃO passa pelo frontend
 */
router.get("/", async (_req, res) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return res.json({
      ok: true,
      data: users,
    });
  } catch (error) {
    console.error("Erro admin usuários:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar usuários",
    });
  }
});

export default router;