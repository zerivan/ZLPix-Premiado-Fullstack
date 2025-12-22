import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * =====================================================
 * ADMIN — AUDITORIA (LOGS)
 * =====================================================
 */
router.get("/", async (_req, res) => {
  try {
    const logs = await prisma.admin_audit_log.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.json({
      ok: true,
      data: logs,
    });
  } catch (error) {
    console.error("Erro audit logs:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao buscar auditoria",
    });
  }
});

export default router;