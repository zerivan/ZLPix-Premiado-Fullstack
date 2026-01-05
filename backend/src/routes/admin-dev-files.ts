import express from "express";
import fs from "fs";
import path from "path";
import { adminAuth } from "../middlewares/adminAuth";

const router = express.Router();

// raiz segura do projeto (ajuste se quiser)
const PROJECT_ROOT = path.resolve(process.cwd(), ".."); 
// Ex: /opt/render/project/src

router.post("/ler-arquivo", adminAuth, (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ ok: false, erro: "filePath inválido" });
    }

    // bloqueios básicos
    if (
      filePath.includes("..") ||
      filePath.includes(".env") ||
      filePath.includes("node_modules") ||
      filePath.includes(".git")
    ) {
      return res.status(403).json({ ok: false, erro: "Acesso negado" });
    }

    const absolutePath = path.resolve(PROJECT_ROOT, filePath);

    // garante que não saiu da raiz
    if (!absolutePath.startsWith(PROJECT_ROOT)) {
      return res.status(403).json({ ok: false, erro: "Path fora do projeto" });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ ok: false, erro: "Arquivo não encontrado" });
    }

    const ext = path.extname(absolutePath);
    if (![".ts", ".tsx", ".js", ".json"].includes(ext)) {
      return res.status(403).json({ ok: false, erro: "Tipo de arquivo não permitido" });
    }

    const content = fs.readFileSync(absolutePath, "utf-8");

    return res.json({
      ok: true,
      filePath,
      content,
    });
  } catch (err) {
    console.error("Erro ao ler arquivo:", err);
    return res.status(500).json({ ok: false, erro: "Erro interno" });
  }
});

export default router;