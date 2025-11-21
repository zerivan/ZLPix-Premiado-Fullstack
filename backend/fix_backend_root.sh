#!/bin/bash
echo "🔧 Removendo rota raiz HTML e deixando backend limpo..."

# Reescreve o server.ts corretamente
cat << 'TS' > src/server.ts
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { load, save, loadMeta, saveMeta } from "./jsondb.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ====== TESTE SIMPLES DO BACKEND ======
app.get("/", (req, res) => {
  res.json({
    ok: true,
    api: "ZLPix Backend ativo",
    version: "1.0",
  });
});

// ====== Iniciar servidor ======
app.listen(PORT, () => {
  console.log("🔥 Backend rodando na porta", PORT);
});
TS

echo "📌 server.ts corrigido!"
echo "📦 Recriando build..."
rm -rf dist
npm run build
echo "🚀 Pronto! Agora faça:"
echo "git add -A && git commit -m 'fix: backend root route clean' && git push --force"
