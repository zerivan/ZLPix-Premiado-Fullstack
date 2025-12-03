import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const r = await fetch(
      "https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/last"
    );

    const data = await r.json();

    res.json({
      ok: true,
      data,
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      erro: "Falha ao consultar a Caixa",
    });
  }
});

export default router;