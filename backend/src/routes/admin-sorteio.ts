import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

type FederalResponse = {
  ok: boolean;
  data?: {
    dataApuracao: string;
    premios: string[];
  };
};

router.post("/apurar", async (req, res) => {
  try {
    const { sorteioData, premiosFederal } = req.body;

    if (!sorteioData) {
      return res.status(400).json({
        ok: false,
        error: "sorteioData é obrigatória",
      });
    }

    let premios: string[] | undefined;

    if (Array.isArray(premiosFederal) && premiosFederal.length === 5) {
      premios = premiosFederal;
    } else {
      const resp = await fetch(
        `${process.env.BACKEND_URL || "http://localhost:4000"}/federal`
      );

      const json = (await resp.json()) as FederalResponse;

      if (!json.ok || !Array.isArray(json.data?.premios)) {
        return res.status(400).json({
          ok: false,
          error: "Não foi possível obter resultado da Federal",
        });
      }

      if (json.data.premios.length !== 5) {
        return res.status(400).json({
          ok: false,
          error: "Resultado da Federal inválido",
        });
      }

      premios = json.data.premios;
    }

    // 🔥 CORREÇÃO: NÃO PROCESSAR AQUI
    const resultado = await processarSorteio(
      new Date(sorteioData),
      { dezenas: premios }
    );

    return res.json({
      ok: true,
      origem: premiosFederal ? "manual" : "federal",
      resultado,
    });
  } catch (error) {
    console.error("Erro apuração admin:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao apurar sorteio",
    });
  }
});

export default router;