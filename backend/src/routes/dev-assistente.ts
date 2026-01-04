import express from "express";
import fs from "fs";
import path from "path";
import { ASSISTENTE_CONTRATO } from "../assistente/contrato";
import { analisarErro } from "../services/ai";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

/**
 * Helper — carrega confing.json
 * Fonte de verdade do sistema
 */
function loadSystemConfig() {
  try {
    const configPath = path.resolve(
      __dirname,
      "../../confing.json"
    );
    const raw = fs.readFileSync(configPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erro ao carregar confing.json:", err);
    return null;
  }
}

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

    // 🔹 Carrega configurações reais do sistema
    const systemConfig = loadSystemConfig();

    /**
     * Montagem do prompt com:
     * - contrato fixo
     * - contexto real do projeto
     * - pergunta do usuário
     */
    const prompt = `
${JSON.stringify(ASSISTENTE_CONTRATO, null, 2)}

CONTEXTO DO SISTEMA (fonte: confing.json):
${JSON.stringify(systemConfig, null, 2)}

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