import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import pixroutes from "./routes/pixroutes";

const app = express();

app.use(cors());
app.use(express.json());

// Necessário para TypeScript
const __dirname = path.resolve();

// =============================
// 🔥 SERVE O FRONT-END BUILDADO
// =============================
app.use(express.static(path.join(__dirname, "front-end/dist")));

// 🔥 SERVE SUBPASTAS DO FRONT-END
app.use("/paginas", express.static(path.join(__dirname, "front-end/paginas")));
app.use("/assets", express.static(path.join(__dirname, "front-end/dist/assets")));
app.use("/img", express.static(path.join(__dirname, "front-end/img")));
app.use("/css", express.static(path.join(__dirname, "front-end/css")));
app.use("/js", express.static(path.join(__dirname, "front-end/js")));

// =============================
// 🔥 ROTAS DO BACKEND
// =============================
app.use("/pix", pixroutes);

// =============================
// 🔥 FALLBACK PARA SPA / HTML
// =============================
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "front-end/dist/index.html"));
});

// =============================
// 🔥 PORTA
// =============================
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});