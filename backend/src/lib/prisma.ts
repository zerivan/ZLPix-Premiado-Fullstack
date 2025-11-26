import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiplas instâncias no modo dev
  // (precisa usar "var" no global em TS)
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Prisma 7 agora exige datasource aqui
    datasourceUrl: process.env.DATABASE_URL,
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}