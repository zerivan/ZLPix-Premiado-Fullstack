import { Router } from "express";
import multer from "multer";
import unzipper from "unzipper";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { OpenAI } from "openai";

const router = Router();
const upload = multer({ dest: os.tmpdir() });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function lerArquivos(dir: string): Promise<string> {
  const arquivos = await fs.readdir(dir);
  let conteudo = "";

  for (const arquivo of arquivos) {
    const fullPath = path.join(dir, arquivo);
    const stat = await fs.stat(fullPath);

    if (stat.isDirectory()) {
      if (["node_modules", "dist", ".git"].includes(arquivo)) continue;
      conteudo += await lerArquivos(fullPath);
    } else {
      if (/\.(ts|tsx|js|prisma)$/i.test(arquivo) && stat.size < 150000) {
        const texto = await fs.readFile(fullPath, "utf8");
        conteudo += `\n\n// ===== ${fullPath} =====\n`;
        conteudo += texto.slice(0, 15000);
      }
    }
  }

  return conteudo;
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ resposta: "ZIP não enviado." });
    }

    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "zlpix-")
    );

    await fs
      .createReadStream(req.file.path)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    const codigo = await lerArquivos(tempDir);

    const prompt = `
Analise tecnicamente o projeto abaixo.
Informe:
- erros estruturais
- possíveis bugs
- falhas de arquitetura
- inconsistências
- melhorias recomendadas

CÓDIGO:
${codigo}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    await fs.remove(tempDir);
    await fs.remove(req.file.path);

    return res.json({
      resposta: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      resposta: "Erro ao processar diagnóstico.",
    });
  }
});

export default router;