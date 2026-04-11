import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}

export async function analisarErro(prompt: string): Promise<string> {
  const openai = getClient();

  if (!openai) {
    throw new Error("OPENAI_API_KEY não configurada");
  }

  const response = await openai.responses.create({
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