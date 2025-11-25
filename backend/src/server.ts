import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ROTA INICIAL / TESTE
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "ZLPix backend rodando." });
});

// ROTAS
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

// START SERVER
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});