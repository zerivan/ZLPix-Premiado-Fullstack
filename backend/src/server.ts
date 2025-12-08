import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =======================
// 🔥 CORS CORRIGIDO (Render + Localhost)
// =======================
const FRONT_URL = "https://zlpix-premiado-site.onrender.com";

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin || // permite ferramentas internas
        origin === FRONT_URL ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
      } else {
        console.warn("❌ CORS bloqueado para origem:", origin);
        callback(new Error("CORS bloqueado"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// =======================
// Health-check
// =======================
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

// =======================
// 🔗 Rotas principais
// =======================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);
app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes);

// =======================
// 🚀 Start
// =======================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});