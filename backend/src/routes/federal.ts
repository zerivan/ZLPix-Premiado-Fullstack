import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const response = await fetch(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/last"
    );

    const data = await response.json();

    res.json({
      ok: true,
      data,
    });
  } catch (err) {
    console.error("Erro ao buscar Federal:", err);
    res.status(500).json({
      ok: false,
      erro: "Falha ao consultar a Caixa",
    });
  }
});

export default router;