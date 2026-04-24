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

    // 🔧 CORREÇÃO: converter milhar → dezenas (2 dígitos)
    const dezenas: string[] = [];

    for (const num of premios) {
      const clean = String(num || "").replace(/\D/g, "");

      if (clean.length < 4) continue;

      const milhar = clean.slice(-4);

      dezenas.push(milhar.slice(0, 2));
      dezenas.push(milhar.slice(2, 4));
    }

    const resultado = await processarSorteio(
      new Date(sorteioData),
      { dezenas }
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