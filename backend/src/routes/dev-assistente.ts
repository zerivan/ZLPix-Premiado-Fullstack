import express from "express";
import { ASSISTENTE_CONTRATO } from "../assistente/contrato";
import { analisarErro } from "../services/ai";

const router = express.Router();

/**
 * POST /dev/assistente
 *
 * Endpoint do assistente residente do projeto.
 * Ele SEMPRE segue o contrato profissional:
 * - Analisa primeiro
 * - Explica a estrutura correta
 * - Só reconstrói após confirmação explícita
 */
router.post("/", async (req, res) => {
  try {
    const { mensagem, contextoExtra } = req.body;

    if (!mensagem) {
      return res.status(400).json({
        ok: false,
        erro: "Campo 'mensagem' é obrigatório",
      });
    }

    /**
     * Montagem do contexto fixo + mensagem do usuário
     * Isso garante personalidade estável e anti-loop
     */
    const prompt = `
${JSON.stringify(ASSISTENTE_CONTRATO, null, 2)}

USUÁRIO:
${mensagem}

CONTEXTO ADICIONAL (se houver):
${contextoExtra || "nenhum"}

INSTRUÇÕES OBRIGATÓRIAS:
- NÃO escreva código final se o usuário não confirmar reconstrução
- Primeiro analise e explique a estrutura correta
- Seja técnico, direto e profissional
`;

    const resposta = await analisarErro(prompt);

    return res.json({
      ok: true,
      resposta,
    });
  } catch (err) {
    console.error("Erro no assistente:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao executar o assistente",
    });
  }
});

export default router;