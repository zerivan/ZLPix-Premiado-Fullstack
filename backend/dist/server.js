import express from "express";
import cors from "cors";
import path from "path";
import pixroutes from "./routes/pixroutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Sobe um nível (sai de /backend e vai para a raiz do projeto)
const root = path.join(path.resolve(), "..");

// =============================
// 🔥 SERVE O DIST DO FRONT-END
// =============================
app.use(express.static(path.join(root, "front-end/dist")));

// =============================
// 🔥 SERVE SUBPASTAS NORMAIS
// =============================
app.use("/paginas", express.static(path.join(root, "front-end/paginas")));
app.use("/css", express.static(path.join(root, "front-end/css")));
app.use("/js", express.static(path.join(root, "front-end/js")));
app.use("/img", express.static(path.join(root, "front-end/img")));

// =============================
// 🔥 ROTAS DO BACKEND
// =============================
app.use("/pix", pixroutes);

// =============================
// 🔥 FALLBACK
// =============================
app.get("*", (req, res) => {
  res.sendFile(path.join(root, "front-end/dist/index.html"));
});

// =============================
// 🔥 PORTA
// =============================
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});