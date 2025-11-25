import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "ZLPix backend rodando." });
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
