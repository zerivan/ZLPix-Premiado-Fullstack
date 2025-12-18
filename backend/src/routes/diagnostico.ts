import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analisarErro(pergunta: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente técnico especializado em diagnóstico de erros de projetos Node.js, TypeScript, Prisma e Render.",
        },
        {
          role: "user",
          content: pergunta,
        },
      ],
      temperature: 0.2,
    });

    const resposta = response.choices[0]?.message?.content;

    // 🔒 GARANTIA ABSOLUTA DE RETURN
    return resposta || "IA respondeu, mas sem conteúdo.";
  } catch (error) {
    console.error("Erro na OpenAI:", error);
    return "Erro interno ao consultar a IA.";
  }
}