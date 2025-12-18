import "dotenv/config";
import express from "express";
import cors from "cors";

// Rotas
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS — FUNCIONAL (ADMIN + CMS)
// =============================
app.use(
  cors({
    origin: true, // 🔥 libera qualquer origin TEMPORARIAMENTE
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

// =============================
// Start
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});