import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
// import usersRoutes from "./routes/users"; // descomente quando o arquivo existir

// 🔒 Garantia de variáveis de ambiente seguras
const requiredEnv = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://fallback_user:fallback_password@localhost:5432/fallbackdb?sslmode=disable",
  JWT_SECRET: process.env.JWT_SECRET || "zlpix_fallback_secret",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "4000",
};

// ⚠️ Alerta se estiver usando fallback (útil para debug)
for (const [key, value] of Object.entries(requiredEnv)) {
  if (String(value).includes("fallback")) {
    console.warn(`⚠️ AVISO: Variável ${key} não encontrada — usando fallback temporário.`);
  }
  process.env[key] = value;
}

const app = express();
const PORT = Number(requiredEnv.PORT) || 4000;

// 🌐 Middlewares
app.use(cors());
app.use(express.json());

// 🩺 Health Check / Test Route
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando no Render + Neon.",
    environment: process.env.NODE_ENV,
    database:
      process.env.DATABASE_URL?.includes("neon.tech")
        ? "Neon ✅"
        : "Local ou fallback ⚠️",
  });
});

// 🔗 Rotas principais
app.use("/auth", authRoutes);
// app.use("/users", usersRoutes); // Descomente quando ativar

// 🚀 Inicializa o servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});