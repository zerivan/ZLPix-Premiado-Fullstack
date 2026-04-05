import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;

    // 🔥 BUSCA DIRETA POR ID
    if (id) {
      const user = await prisma.users.findUnique({
        where: { id: Number(id) },
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
        total: user ? 1 : 0,
        data: user ? [user] : [],
      });
    }

    // 🔥 LISTA PADRÃO (LIMITADA)
    const users = await prisma.users.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // 🔥 TOTAL DE USUÁRIOS
    const total = await prisma.users.count();

    return res.json({
      ok: true,
      total,
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