import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import premioRoutes from "./routes/premioRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Rota principal
app.get("/", (req, res) => {
  res.send("🚀 Backend ZLPix Premiado rodando com sucesso!");
});

// ✅ Rotas de sorteio
app.use("/api", premioRoutes);

// ✅ Porta do servidor
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
