import { PrismaClient } from "@prisma/client";

// 🧠 Garante que o Prisma seja criado uma única vez
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "warn", "error"],
  });

// ♻️ Reaproveita instância
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 🧩 Teste inicial (mantido)
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("🟢 Prisma conectado ao banco com sucesso.");
  } catch (err) {
    console.error("🔴 Erro ao conectar ao banco via Prisma:", err);
  }
}
testConnection();

/**
 * 🔥 NOVO: GARANTE RECONEXÃO AUTOMÁTICA
 */
export async function ensurePrismaConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.warn("⚠️ Prisma perdeu conexão. Reconectando...");

    try {
      await prisma.$disconnect();
    } catch {}

    await prisma.$connect();
  }
}

export default prisma;