import express from "express";
import { ASSISTENTE_CONTRATO } from "../assistente/contrato";
import { analisarErro } from "../services/ai";
import { adminAuth } from "../middlewares/adminAuth";

// ✅ IMPORT DIRETO DO JSON (compatível com build + Render)
import config from "../../confing.json";

const router = express.Router();

/**
 * POST /api/admin/ia/chat
 *
 * Assistente residente do projeto (ChatGPT real do painel admin)
 *
 * Protocolo obrigatório:
 * - Analisa primeiro
 * - Explica causas e estrutura
 * - Só reconstrói código com confirmação explícita
 * - Nunca executa ações destrutivas
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({
        ok: false,
        erro: "Campo 'mensagem' é obrigatório",
      });
    }

    /**
     * Montagem do prompt com:
     * - contrato fixo
     * - contexto real do projeto
     * - pergunta do usuário
     */
    const prompt = `
${JSON.stringify(ASSISTENTE_CONTRATO, null, 2)}

CONTEXTO DO SISTEMA (fonte: confing.json):
${JSON.stringify(config, null, 2)}

USUÁRIO:
${mensagem}

INSTRUÇÕES OBRIGATÓRIAS:
- Analise antes de responder
- Explique o PORQUÊ técnico das coisas
- Não escreva código final sem confirmação explícita
- Não invente arquivos ou regras
- Respeite o estado atual do sistema
- Seja direto, técnico e profissional
`.trim();

    const resposta = await analisarErro(prompt);

    return res.json({
      ok: true,
      resposta,
    });
  } catch (err) {
    console.error("Erro no assistente admin:", err);
    return res.status(500).json({
      ok: false,
      erro: "Falha ao executar o assistente",
    });
  }
});

export default router;
