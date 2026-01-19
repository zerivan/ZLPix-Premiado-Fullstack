import { Router } from "express";
import { processarSorteio } from "../services/sorteio-processor";

const router = Router();

/**
 * ============================
 * TIPAGEM DA FEDERAL
 * ============================
 */
type FederalResponse = {
  ok: boolean;
  data?: {
    dataApuracao: string;
    premios: string[]; // 1º ao 5º prêmio (milhar)
  };
};

/**
 * =====================================================
 * ADMIN — APURAR SORTEIO (MANUAL / BACKUP / AUTOMÁTICO)
 * =====================================================
 * Regra híbrida:
 * - Se vier `premiosFederal` → modo MANUAL
 * - Se NÃO vier → busca resultado REAL da Federal
 */
router.post("/apurar", async (req, res) => {
  try {
    const { sorteioData, premioTotal, premiosFederal } = req.body;

    if (!sorteioData) {
      return res.status(400).json({
        ok: false,
        error: "sorteioData é obrigatória",
      });
    }

    const premio = Number(premioTotal);
    if (!premio || premio <= 0) {
      return res.status(400).json({
        ok: false,
        error: "premioTotal inválido",
      });
    }

    let premios: string[] | undefined;

    /**
     * ============================
     * MODO MANUAL (ADMIN)
     * ============================
     */
    if (Array.isArray(premiosFederal) && premiosFederal.length === 5) {
      premios = premiosFederal;
    } else {
      /**
       * ============================
       * MODO AUTOMÁTICO (FEDERAL)
       * ============================
       */
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

    /**
     * ============================
     * MONTA DEZENAS VÁLIDAS
     * ============================
     */
    const dezenas: string[] = [];
    for (const num of premios) {
      dezenas.push(num.slice(0, 2));
      dezenas.push(num.slice(-2));
    }

    if (dezenas.length !== 10) {
      return res.status(400).json({
        ok: false,
        error: "Dezenas inválidas",
      });
    }

    /**
     * ============================
     * MOTOR OFICIAL
     * ============================
     */
    const resultado = await processarSorteio(
      new Date(sorteioData),
      {
        dezenas,
        premioTotal: premio,
      }
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
