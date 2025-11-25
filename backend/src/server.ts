// backend/src/server.ts
import express from "express";
import cors from "cors";

// rotas
import authroutes from "./routes/auth";   // login + registro
import usersroutes from "./routes/users"; // nova rota de lista de clientes

// jsondb (mantido como estava)
import { load, save, loadMeta, saveMeta } from "./jsondb.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

/* ============================================================
   ROTA RAIZ (TESTE)
============================================================ */
app.get("/", (req, res) => {
  res.json({
    ok: true,
    api: "ZLPix Backend ativo",
    version: "1.0",
  });
});

/* ============================================================
   ROTAS DE AUTENTICAÇÃO
============================================================ */
app.use("/auth", authroutes);

/* ============================================================
   ROTAS DE USUÁRIOS (NOVA)
============================================================ */
app.use("/users", usersroutes);

/* ============================================================
   INICIAR SERVIDOR
============================================================ */
app.listen(PORT, () => {
  console.log("🔥 Backend rodando na porta", PORT);
});