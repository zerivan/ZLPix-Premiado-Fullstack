import "dotenv/config";
import express from "express";
import cors from "cors";

// =============================
// ROTAS PÚBLICAS / CORE DO SITE
// =============================
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// =============================
// CORS
// =============================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// =============================
// HEALTHCHECK
// =============================
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
  });
});

// =============================
// ROTAS DO SITE (AUTOMÁTICAS)
// =============================
app.use("/auth", authRoutes);
app.use("/api/federal", federalRoutes);

app.use("/pix", pixRoutes);
app.use("/pix/webhook", pixWebhookRoutes);

app.use("/bilhete", bilheteRoutes);

// =============================
// START
// =============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});