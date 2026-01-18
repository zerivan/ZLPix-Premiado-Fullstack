// backend/src/routes/admin-apuracao.ts
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
 * ADMIN — APURAR SORTEIO (MANUAL / BACKUP)
 * =====================================================
 * - NÃO calcula ganhadores
 * - NÃO aplica regra
 * - NÃO mexe em bilhetes diretamente
 * - Apenas:
 *   1) busca resultado REAL da Federal
 *   2) monta dezenas válidas
 *   3) chama o motor oficial (processarSorteio)
 */
router.post("/apurar", async (req, res) => {
  try {
    const { sorteioData, premioTotal } = req.body;

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

    // 🔎 Busca resultado REAL da Federal
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

    // 🎯 Monta dezenas válidas (frente e fundo)
    const dezenas: string[] = [];
    for (const num of json.data.premios) {
      dezenas.push(num.slice(0, 2));
      dezenas.push(num.slice(-2));
    }

    if (dezenas.length !== 10) {
      return res.status(400).json({
        ok: false,
        error: "Dezenas da Federal inválidas",
      });
    }

    // 🚀 Chama o MOTOR OFICIAL
    const resultado = await processarSorteio(
      new Date(sorteioData),
      {
        dezenas,
        premioTotal: premio,
      }
    );

    return res.json({
      ok: true,
      origem: "manual",
      resultado,
    });
  } catch (error) {
    console.error("Erro apuração manual:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao apurar sorteio manualmente",
    });
  }
});

export default router;