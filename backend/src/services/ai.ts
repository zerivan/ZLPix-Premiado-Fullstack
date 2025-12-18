import OpenAI from "openai";

export async function analisarErro(mensagem: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não definida");
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Você é um engenheiro de software profissional responsável pelo projeto."
      },
      {
        role: "user",
        content: mensagem
      }
    ],
    temperature: 0.2
  });

  return response.choices[0]?.message?.content || "Sem resposta";
}