import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
// import usersRoutes from "./routes/users"; // descomente quando o arquivo existir

// 🔒 Fallback de variáveis de ambiente
const requiredEnv = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://fallback_user:fallback_password@localhost:5432/fallbackdb?sslmode=disable",
  JWT_SECRET: process.env.JWT_SECRET || "zlpix_fallback_secret",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "4000",
};

// ⚙️ Exibe aviso no console caso alguma esteja em fallback
Object.entries(requiredEnv).forEach(([key, value]) => {
  if (String(value).includes("fallback")) {
    console.warn(`⚠️  AVISO: Variável ${key} não encontrada — usando fallback temporário.`);
  }
  process.env[key] = value;
});

const app = express();
const PORT = Number(requiredEnv.PORT);

app.use(cors());
app.use(express.json());

// 🩺 Health Check / Test Route
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando no Render + Neon.",
    environment: process.env.NODE_ENV,
  });
});

// 🔗 Routes
app.use("/auth", authRoutes);
// app.use("/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});