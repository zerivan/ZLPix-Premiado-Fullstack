import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaReconnectPromise: Promise<void> | null;
};

const basePrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

function isClosedConnectionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P1017" || error.code === "P1001";
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message =
    error instanceof Error ? error.message : String(error ?? "");

  return (
    /\bclosed\b/i.test(message) ||
    /can't reach database server/i.test(message)
  );
}

async function reconnectPrisma() {
  if (!globalForPrisma.prismaReconnectPromise) {
    globalForPrisma.prismaReconnectPromise = (async () => {
      console.warn("⚠️ Prisma sem conexão válida. Reconectando...");

      try {
        await basePrisma.$disconnect(); // 🔥 IMPORTANTE
      } catch {}

      await basePrisma.$connect();

      console.log("🟢 Prisma reconectado com sucesso.");
    })().finally(() => {
      globalForPrisma.prismaReconnectPromise = null;
    });
  }

  await globalForPrisma.prismaReconnectPromise;
}

const prismaWithReconnect = basePrisma.$extends({
  query: {
    async $allOperations({ args, query }) {
      try {
        return await query(args);
      } catch (error) {
        if (!isClosedConnectionError(error)) {
          throw error;
        }

        console.warn("⚠️ Erro de conexão detectado. Tentando reconectar...");

        await reconnectPrisma();

        return query(args); // 🔁 retry único
      }
    },
  },
});

export const prisma = prismaWithReconnect as PrismaClient;

// 🔥 Mantido apenas para log inicial (opcional)
async function testConnection() {
  try {
    await basePrisma.$connect();
    console.log("🟢 Prisma conectado ao banco com sucesso.");
  } catch (err) {
    console.error("🔴 Erro ao conectar ao banco via Prisma:", err);
  }
}

testConnection();

export async function ensurePrismaConnection() {
  await reconnectPrisma();
}

export default prisma;