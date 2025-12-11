// src/prismaClient.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Em produção (Render), cria apenas 1 cliente normal
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento (Termux/Android), evita múltiplas conexões
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export { prisma };
export default prisma;