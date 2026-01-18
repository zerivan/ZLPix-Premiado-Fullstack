import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

type FederalResponse = {
  ok: boolean;
  data?: {
    premios: string[];
  };
};

router.post("/processar", async (req, res) => {
  try {
    const { sorteioData, premioTotal } = req.body;

    if (!sorteioData) {
      return res.status(400).json({
        success: false,
        reason: "Data do sorteio não informada",
      });
    }

    const premio = Number(premioTotal);
    if (!premio || premio <= 0) {
      return res.status(400).json({
        success: false,
        reason: "Prêmio total inválido",
      });
    }

    const resp = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
    );

    const json = (await resp.json()) as FederalResponse;

    if (!json.ok || !Array.isArray(json.data?.premios)) {
      return res.status(400).json({
        success: false,
        reason: "Não foi possível obter resultado da Federal",
      });
    }

    if (json.data.premios.length !== 5) {
      return res.status(400).json({
        success: false,
        reason: "Resultado da Federal inválido",
      });
    }

    const dezenas: string[] = [];
    for (const num of json.data.premios) {
      dezenas.push(num.slice(0, 2));
      dezenas.push(num.slice(-2));
    }

    await processarSorteio(new Date(sorteioData), {
      dezenas,
      premioTotal: premio,
    });

    return res.json({
      success: true,
      message: "Sorteio processado com sucesso (manual)",
    });
  } catch (err) {
    console.error("Erro ao processar sorteio manual:", err);
    return res.status(500).json({
      success: false,
      reason: "Erro interno ao processar sorteio",
    });
  }
});

export default router;