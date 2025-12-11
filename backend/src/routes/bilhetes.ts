// backend/routes/bilhete.ts
const express = require("express");
const router = express.Router();
const { prisma } = require("../prismaClient"); // adapte

// Retornar bilhetes do usuário (para polling)
router.get("/listar/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // Ajuste conforme seu schema real
    const bilhetes = await prisma.bilhete.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ bilhetes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "erro interno" });
  }
});

module.exports = router;