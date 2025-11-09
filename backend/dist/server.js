import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// ✅ Rota inicial (teste de funcionamento)
app.get("/", (req, res) => {
    res.send("🚀 Backend ZLPix Premiado rodando com sucesso!");
});
// ✅ Configuração da porta
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
