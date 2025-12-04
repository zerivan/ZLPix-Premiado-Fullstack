require("dotenv/config");
const express = require("express");
const cors = require("cors");

// Rotas compiladas (vamos criar depois manualmente)
const authRoutes = require("./routes/auth.js");
const federalRoutes = require("./routes/federal.js");

// ====== CONFIGURAÇÃO DE AMBIENTE ======
const requiredEnv = {
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://fallback_user:fallback_password@localhost:5432/fallbackdb?sslmode=disable",
  JWT_SECRET: process.env.JWT_SECRET || "zlpix_fallback_secret",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "4000",
};

for (const key in requiredEnv) {
  process.env[key] = requiredEnv[key];
}

// ====== SERVIDOR ======
const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando (versão compilada).",
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL.includes("neon.tech")
      ? "Neon conectado ✔"
      : "Local/Fallback ⚠",
  });
});

// Rotas
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando manualmente na porta ${PORT}`);
});