import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

router.get("/preview/:page", async (req, res) => {
  const { page } = req.params;
  const token = req.query.token;

  if (!token) {
    return res.status(401).send("Preview não autorizado");
  }

  const areas = await prisma.cmsArea.findMany({
    where: { page },
    select: { key: true, contentHtml: true },
  });

  res.json({
    ok: true,
    data: areas,
  });
});

export default router;