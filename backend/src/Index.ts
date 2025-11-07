import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pixRoutes from "./routes/pixRoutes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/pix", pixRoutes);

app.get("/", (_, res) => {
  res.send("🚀 Backend do ZLPix Premiado está rodando!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
