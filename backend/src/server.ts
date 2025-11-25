import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check / teste rápido
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "ZLPix backend rodando." });
});

// Rotas de autenticação
app.use("/auth", authRoutes);

// Manter Prisma estável no Render
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});