import { Router, Request, Response } from "express";
import { analisarErro } from "../services/ai";

const router = Router();

/**
 * =====================================================
 * POST /api/admin/diagnostico
 * Diagnóstico técnico com IA (uso admin)
 * =====================================================
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { pergunta } = req.body;

    if (!pergunta || typeof pergunta !== "string") {
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
  } catch (error) {
    console.error("❌ Erro na rota /api/admin/diagnostico:", error);

    return res.status(500).json({
      ok: false,
      erro: "Falha ao consultar a IA",
    });
  }
});

export default router;