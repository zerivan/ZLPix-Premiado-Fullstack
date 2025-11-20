import express from "express";
import cors from "cors";
import crypto from "crypto";
import { load, save, loadMeta, saveMeta } from "./jsondb.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = "zlpix-admin-token";

// ====== Funções auxiliares ======
const now = () => Math.floor(Date.now() / 1000);

function extractCandidates(prizes: string[]) {
  const out = new Set<string>();
  for (const p of prizes) {
    if (!p || p.length !== 5) continue;
    out.add(p.slice(0, 2)); // primeiras 2 dezenas
    out.add(p.slice(3, 5)); // últimas 2 dezenas
  }
  return [...out];
}

// ====== Meta inicial ======
let meta = loadMeta();
if (!meta.prize_base) meta.prize_base = 500;
if (!meta.accumulated) meta.accumulated = 0;
saveMeta(meta);

// ====== Rota para teste ======
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "🔥 Backend do ZLPix funcionando!",
    timestamp: now(),
  });
});

// ====== Iniciar servidor ======
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});