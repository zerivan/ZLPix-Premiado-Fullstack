// backend/src/routes/testdb.ts
import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/test-db", async (_req, res) => {
  try {
    // ✔ Query Raw CORRIGIDO (usa queryRawUnsafe para compatibilidade total)
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `);

    res.json({
      connected: true,
      db: process.env.DATABASE_URL,
      tables
    });

  } catch (err: any) {
    console.error("Erro /test-db:", err);
    res.status(500).json({
      connected: false,
      error: err.message
    });
  }
});

export default router;