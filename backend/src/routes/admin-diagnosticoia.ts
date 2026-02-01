import { Router } from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

const router = Router();
const upload = multer({ dest: "tmp/" });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "Arquivo não enviado",
      });
    }

    const zipPath = req.file.path;
    const extractPath = path.join("tmp", `extract_${Date.now()}`);

    fs.mkdirSync(extractPath, { recursive: true });

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);

    function buildTree(dir: string): any[] {
      const items = fs.readdirSync(dir);

      return items.map((item) => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          return {
            type: "folder",
            name: item,
            children: buildTree(fullPath),
          };
        }

        return {
          type: "file",
          name: item,
        };
      });
    }

    const tree = buildTree(extractPath);

    // limpeza
    fs.rmSync(zipPath, { force: true });
    fs.rmSync(extractPath, { recursive: true, force: true });

    return res.json({
      ok: true,
      message: "Projeto analisado com sucesso",
      estrutura: tree,
    });
  } catch (error) {
    console.error("Erro diagnóstico IA:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao analisar projeto",
    });
  }
});

export default router;