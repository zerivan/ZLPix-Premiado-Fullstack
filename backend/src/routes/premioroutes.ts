import { Router } from "express";

const router = Router();

// ✅ Simula um sorteio de prêmio
router.get("/premio", (req, res) => {
  const premios = ["Pix R$50", "Pix R$100", "Pix R$200", "Nada ainda 😅"];
  const premio = premios[Math.floor(Math.random() * premios.length)];
  res.json({ sucesso: true, premio });
});

export default router;
