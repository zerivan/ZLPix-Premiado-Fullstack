import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/preview/:page", async (req, res) => {
  const { page } = req.params;
  const token = req.query.token;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Preview não autorizado" });
  }

  try {
    const areas = await prisma.appContent.findMany({
      where: { page },
      select: {
        key: true,
        contentHtml: true,
      },
    });

    return res.json({
      ok: true,
      data: areas,
    });
  } catch (err) {
    console.error("Erro CMS Preview:", err);
    return res.status(500).json({ ok: false });
  }
});

export default router;