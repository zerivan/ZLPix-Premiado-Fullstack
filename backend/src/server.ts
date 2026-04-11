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
      path === "/auth/admin/login" ||
      path === "/auth/admin/refresh" ||
      path === "/auth/admin/verify" ||

      // 🔥 SUPORTE /api
      path === "/api/auth/login" ||
      path === "/api/auth/recover" ||
      path === "/api/auth/reset-password" ||
      path === "/api/auth/admin/login" ||
      path === "/api/auth/admin/refresh" ||
      path === "/api/auth/admin/verify";

    const isHealthCheck = path === "/";

    const isPushRoute =
      path === "/push/token" ||
      path === "/push/send" ||
      path === "/api/push/token" ||
      path === "/api/push/send";

    if (isAdminRoute || isAllowedAuthRoute || isHealthCheck || isPushRoute) {
      return next();
    }

    // 🔥 CORREÇÃO CRÍTICA — PROTEGER PRISMA
    let row = null;

    try {
      row = await prisma.appContent.findUnique({
        where: { key: "configuracoes_gerais" },
      });
    } catch (err) {
      console.error("⚠️ Prisma falhou no middleware global:", err);
      return next(); // 🔥 NÃO BLOQUEIA REQUEST
    }

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