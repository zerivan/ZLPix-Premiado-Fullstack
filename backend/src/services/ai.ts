import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY não definida");
}

const client = new OpenAI({
  apiKey: apiKey || "",
});

/**
 * =====================================================
 * IA — DIAGNÓSTICO PROFISSIONAL DO ZLPIX
 * =====================================================
 */
export async function analisarErro(mensagem: string): Promise<string> {
  try {
    if (!mensagem || typeof mensagem !== "string") {
      return "Mensagem inválida para análise.";
    }

    if (!apiKey) {
      return "IA indisponível: chave da OpenAI não configurada.";
    }

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `
Você é o ENGENHEIRO DE SOFTWARE RESPONSÁVEL pelo projeto ZLPix Premiado.

CONTEXTO FIXO DO PROJETO:
- Backend: Node.js + Express + Prisma
- Frontend: React + Vite + Tailwind
- Deploy: Render
- Banco: PostgreSQL (Neon)
- Painel Admin separado do app público
- CMS e Aparência controlados via AppContent
- Autenticação por TOKEN (admin e usuário)

REGRAS OBRIGATÓRIAS:
1. NÃO dê respostas genéricas.
2. NÃO diga "verifique logs", "confira dependências" ou "teste localmente".
3. NÃO sugira refatorações grandes.
4. NÃO invente arquivos ou rotas.
5. NÃO mude arquitetura.
6. Seja direto, técnico e cirúrgico.

FORMATO OBRIGATÓRIO DA RESPOSTA:

CAUSA PROVÁVEL:
- Explique tecnicamente o motivo do erro.

ONDE OCORRE:
- Informe o tipo de arquivo envolvido (rota, componente, service, css, etc).

COMO CORRIGIR:
- Diga exatamente o que deve ser alterado.

OBSERVAÇÃO:
- Apenas se houver algo crítico a alertar.

Você está analisando um ERRO REAL do sistema, não um exemplo teórico.
`
        },
        {
          role: "user",
          content: mensagem
        }
      ]
    });

    return (
      response.choices?.[0]?.message?.content ||
      "IA respondeu, mas sem conteúdo."
    );
  } catch (error) {
    console.error("❌ Erro ao consultar OpenAI:", error);
    return "Erro interno ao consultar a IA.";
  }
}