import express from "express";
import cors from "cors";
import pixroutes from "./routes/pixroutes";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/pix", pixroutes);

app.get("/", (_, res) => {
  res.send("🚀 Servidor ZLPix Premiado rodando com sucesso!");
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando na porta ${PORT}`);
});
