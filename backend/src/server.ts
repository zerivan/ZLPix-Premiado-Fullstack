import authroutes from "./routes/auth";
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
