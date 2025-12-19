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
 * IA — Diagnóstico técnico do sistema
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
      messages: [
        {
          role: "system",
          content:
            "Você é um engenheiro de software sênior responsável por diagnosticar erros em projetos Node.js, TypeScript, Prisma e Render.",
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
      temperature: 0.2,
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