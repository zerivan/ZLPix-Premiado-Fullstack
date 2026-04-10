import "dotenv/config";
import express from "express";
import cors from "cors";

// 🔥 IMPORTA O CRON DO SORTEIO (AUTO-EXECUÇÃO)
import "./jobs/sorteio-cron";

// ROTAS DO SITE
import authRoutes from "./routes/auth";
import federalRoutes from "./routes/federal";
import pixRoutes from "./routes/pix";
import pixWebhookRoutes from "./routes/pixwebhook";
import bilheteRoutes from "./routes/bilhetes";
import walletRoutes from "./routes/wallet";

// PUSH
import pushRoutes from "./routes/push";

// 🔥 NOVO: ADMIN PUSH MANUAL
import adminPushRoutes from "./routes/admin-push";

// ROTAS ADMIN
import adminUsuariosRoutes from "./routes/admin-usuarios";
import adminGanhadoresRoutes from "./routes/admin-ganhadores";
import adminRelatoriosRoutes from "./routes/admin-relatorios";
import adminCmsRoutes from "./routes/admin-cms";
import adminApuracaoRoutes from "./routes/admin-apuracao";
import adminConfiguracoesRoutes from "./routes/admin-configuracoes";
import adminSaquesRoutes from "./routes/admin-saques";
import adminSorteioRoutes from "./routes/admin-sorteio";

// IA ADMIN
import devAssistenteRoutes from "./routes/dev-assistente";

// 🔥 NOVO: ASSISTENTE CLIENTE
import assistantRoutes from "./routes/assistant";

// CMS
import cmsPublicRoutes from "./routes/cms-public";
import cmsPreviewRoutes from "./routes/cms-preview";

// Middleware ADMIN
import { adminAuth } from "./middlewares/adminAuth";

// 🔥 NOVO: PRISMA
import { prisma } from "./lib/prisma";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ============================
// CORS
// ============================
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-User-Id",
      "x-user-id",
    ],
  })
);

app.options("*", cors());
app.use(express.json());

// ============================
// 🔥 MODO MANUTENÇÃO (GLOBAL)
// ============================
app.use(async (req, res, next) => {
  try {
    const url = req.originalUrl || "";
    const path = url.split("?")[0].replace(/\/$/, "") || "/";

    const isAdminRoute =
      path === "/api/admin" || path.startsWith("/api/admin/");

    const isAllowedAuthRoute =
      path === "/auth/login" ||
      path === "/auth/recover" ||
      path === "/auth/reset-password" ||
      path === "/auth/admin/login";

    const isHealthCheck = path === "/";

    if (isAdminRoute || isAllowedAuthRoute || isHealthCheck) {
      return next();
    }

    const row = await prisma.appContent.findUnique({
      where: { key: "configuracoes_gerais" },
    });

    let modoManutencao = false;

    if (row?.contentHtml) {
      try {
        const parsed = JSON.parse(row.contentHtml);
        modoManutencao = !!parsed.modoManutencao;
      } catch {
        modoManutencao = false;
      }
    }

    if (modoManutencao) {
      return res.status(503).json({
        maintenance: true,
        message: "Sistema em manutenção",
      });
    }

    next();
  } catch (err) {
    console.error("Erro ao verificar modo manutenção:", err);
    next();
  }
});

// ============================
// HEALTHCHECK
// ============================
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "ZLPix backend rodando!",
  });
});

// ============================
// ROTAS APP
// ============================
app.use("/auth", authRoutes);

// 🔥 FEDERAL — DUPLA ROTA (CORREÇÃO DEFINITIVA)
app.use("/api/federal", federalRoutes);
app.use("/federal", federalRoutes);

app.use("/pix/webhook", pixWebhookRoutes);
app.use("/pix", pixRoutes);
app.use("/bilhete", bilheteRoutes);
app.use("/wallet", walletRoutes);
app.use("/push", pushRoutes);

// 🔥 ASSISTENTE PÚBLICO PADRONIZADO
app.use("/api/assistant", assistantRoutes);

// CMS público
app.use("/api/cms/public", cmsPublicRoutes);
app.use("/api/cms", cmsPreviewRoutes);

// ============================
// ROTAS ADMIN
// ============================
app.use("/api/admin/usuarios", adminAuth, adminUsuariosRoutes);
app.use("/api/admin/ganhadores", adminAuth, adminGanhadoresRoutes);
app.use("/api/admin/relatorios", adminAuth, adminRelatoriosRoutes);
app.use("/api/admin/cms", adminAuth, adminCmsRoutes);
app.use("/api/admin/apuracao", adminAuth, adminApuracaoRoutes);
app.use("/api/admin/configuracoes", adminAuth, adminConfiguracoesRoutes);
app.use("/api/admin/saques", adminAuth, adminSaquesRoutes);
app.use("/api/admin/sorteio", adminAuth, adminSorteioRoutes);

// 🔥 NOVO: ADMIN PUSH MANUAL
app.use("/api/admin/push", adminAuth, adminPushRoutes);

// IA ADMIN
app.use(
  "/api/admin/ia/chat",
  adminAuth,
  devAssistenteRoutes
);

// ============================
// START
// ============================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});