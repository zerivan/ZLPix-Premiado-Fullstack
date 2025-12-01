import { PrismaClient } from "@prisma/client";

// 🧠 Garante que o Prisma seja criado uma única vez (ideal para ambientes serverless)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "warn", "error"],
  });

// ♻️ Em desenvolvimento, reaproveita a instância global (evita múltiplas conexões)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 🧩 Teste rápido de conexão automática (somente loga uma vez)
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("🟢 Prisma conectado ao banco com sucesso.");
  } catch (err) {
    console.error("🔴 Erro ao conectar ao banco via Prisma:", err);
  }
}
testConnection();

export default prisma;