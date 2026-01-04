import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analisarErro(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  const response = await client.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content: `
Você é o Assistente Residente do projeto ZLPix Premiado.
Analise tecnicamente a pergunta.
Explique causas, arquivos e fluxo.
NÃO repita respostas genéricas.
NÃO peça o mesmo contexto duas vezes.
Seja específico.
        `.trim(),
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  if (!response.output_text) {
    throw new Error("Resposta vazia da OpenAI");
  }

  return response.output_text;
}
