import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://loterias-api-svc.onrender.com/api/federal"
    );

    const data = await response.json();

    res.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("Erro rota federal:", err);
    res.status(500).json({
      ok: false,
      erro: "Falha ao consultar o serviço intermediário",
    });
  }
});

export default router;