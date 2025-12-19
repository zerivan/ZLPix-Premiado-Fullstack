import "dotenv/config";
import express from "express";
import cors from "cors";

// Rotas públicas / core
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

// Admin / Dev
import diagnosticoRoutes from "./routes/diagnostico";
import devAssistenteRoutes from "./routes/dev-assistente";
import adminGanhadoresRoutes from "./routes/admin-ganhadores"; // ✅ NOVO

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS — GLOBAL (API + ADMIN)
// =============================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

// =============================
// Healthcheck
// =============================
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
  });
});

// =============================
// ROTAS PÚBLICAS
// =============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);

// =============================
// ROTAS OPERACIONAIS
// =============================
app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes);

// =============================
// ROTAS ADMIN
// =============================

// 🧠 Diagnóstico com IA (Painel Admin)
app.use("/api/admin/diagnostico", diagnosticoRoutes);

// 🏆 Ganhadores (Painel Admin)
app.use("/api/admin/ganhadores", adminGanhadoresRoutes);

// 🧪 Assistente DEV (interno / futuro)
app.use("/api/admin/dev-assistente", devAssistenteRoutes);

// =============================
// START
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});