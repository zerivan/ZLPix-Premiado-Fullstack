// backend/src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Instância segura do Prisma para evitar múltiplas conexões em dev (Hot reload)
 * e garantir tipos corretos.
 */

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = global.__prisma ?? new PrismaClient({
  // não passe opções que possam gerar conflito de tipos aqui.
  // Se precisa de logging ou outras opções, adicione com tipos corretos.
});

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export { prisma };
export default prisma;