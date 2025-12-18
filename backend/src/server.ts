import "dotenv/config";
import express from "express";
import cors from "cors";

// Rotas
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";
import diagnosticoRoutes from "./routes/diagnostico"; // IA simples
import devAssistenteRoutes from "./routes/dev-assistente"; // 🧠 Assistente residente

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS — LIBERADO (DEBUG / IA)
// =============================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
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
// Rotas
// =============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);
app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes);

// 🔥 IA — diagnóstico simples
app.use("/diagnostico", diagnosticoRoutes);

// 🧠 IA — assistente residente (DEV)
app.use("/dev/assistente", devAssistenteRoutes);

// =============================
// Start
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});