import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function perguntarIA(pergunta: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente técnico interno do sistema ZLPix Premiado. Analise código, rotas, erros e arquitetura.",
      },
      {
        role: "user",
        content: pergunta,
      },
    ],
  });

  return response.choices[0].message.content;
}
