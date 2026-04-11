import { PrismaClient } from "@prisma/client";

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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * 🔥 WRAPPER DE RESILIÊNCIA
 * Reexecuta query se conexão estiver fechada
 */
export async function prismaSafe<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const msg = String(error);

    if (msg.includes("Closed") || msg.includes("Connection")) {
      console.warn("⚠️ Prisma conexão perdida. Reconectando...");

      try {
        await prisma.$disconnect();
      } catch {}

      await prisma.$connect();

      return await fn(); // tenta novamente
    }

    throw error;
  }
}

export default prisma;