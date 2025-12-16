import "dotenv/config";
import express from "express";
import cors from "cors";

// Rotas
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes"; // ✅ NOME REAL DO ARQUIVO

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS Render + Local
// =============================
const FRONT_URL = "https://zlpix-premiado-site.onrender.com";

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        origin === FRONT_URL ||
        origin === "http://localhost:5173"
      ) {
        callback(null, true);
      } else {
        console.warn("CORS bloqueado:", origin);
        callback(new Error("CORS não permitido"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// =============================
// Healthcheck
// =============================
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
    env: process.env.NODE_ENV,
  });
});

// =============================
// Rotas
// =============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);
app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);
app.use("/bilhete", bilheteRoutes); // agora resolve corretamente

// =============================
// Start
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});