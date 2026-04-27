import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// 🔥 mesma estratégia de obtenção de userId (mantém padrão do projeto)
function getUserId(req: any): number | null {
  const raw =
    req.headers["x-user-id"] ??
    req.query.userId;

  const valor = Array.isArray(raw) ? raw[0] : raw;
  const userId = Number(valor);

  if (!Number.isFinite(userId) || userId <= 0) {
    return null;
  }

  return userId;
}

router.post("/roleta", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    const premio = Number(req.body.premio);

    if (!Number.isFinite(premio) || premio <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Prêmio inválido",
      });
    }

    // 🔧 garante existência do usuário
    await prisma.userZLP.upsert({
      where: { userId },
      update: {},
      create: { userId, saldo: 0 },
    });

    // 🔧 aplica prêmio
    await prisma.userZLP.updateMany({
      where: { userId },
      data: {
        saldo: { increment: premio },
      },
    });

    // 🔧 retorno consistente
    const atualizado = await prisma.userZLP.findUnique({
      where: { userId },
    });

    return res.json({
      ok: true,
      ganho: premio,
      saldo: Number(atualizado?.saldo ?? 0),
    });

  } catch (error) {
    console.error("[ZLP-ROLETA] erro:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;