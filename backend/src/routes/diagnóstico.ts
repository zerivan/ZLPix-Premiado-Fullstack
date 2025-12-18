import express from "express";
import { analisarErro } from "../services/ai";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta) {
      return res.status(400).json({
        ok: false,
        erro: "Campo 'pergunta' é obrigatório",
      });
    }

    const resposta = await analisarErro(pergunta);

    return res.json({
      ok: true,
      resposta,
    });
  } catch (err) {
    console.error("Erro IA:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao consultar IA",
    });
  }
});

export default router;