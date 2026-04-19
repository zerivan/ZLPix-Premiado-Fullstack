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
        ? ["error", "warn"]
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
    /\bkind\s*:\s*Closed\b/i.test(message) ||
    /can't reach database server/i.test(message) ||
    /connection refused/i.test(message) ||
    /timeout/i.test(message)
  );
}

async function reconnectPrisma() {
  if (!globalForPrisma.prismaReconnectPromise) {
    globalForPrisma.prismaReconnectPromise = (async () => {
      console.warn(
        "⚠️ [PRISMA] Conexão fechada. Reconectando em 2 segundos..."
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        console.log("[PRISMA] Desconectando instância anterior...");
        await basePrisma.$disconnect();
        console.log("[PRISMA] ✅ Desconexão bem-sucedida");
      } catch (disconnectErr) {
        console.warn("[PRISMA] ⚠️ Erro ao desconectar:", disconnectErr);
      }

      try {
        console.log("[PRISMA] Criando nova instância...");

        const newClient = new PrismaClient({
          log:
            process.env.NODE_ENV === "production"
              ? ["error", "warn"]
              : ["query", "warn", "error"],
        });

        await newClient.$connect();

        // 🔥 substitui instância global (sem alterar fluxo existente)
        globalForPrisma.prisma = newClient;

        console.log("🟢 [PRISMA] ✅ Nova instância conectada com sucesso!");
      } catch (connectErr) {
        console.error(
          "🔴 [PRISMA] ❌ Falha ao recriar conexão:",
          connectErr instanceof Error ? connectErr.message : connectErr
        );
        throw connectErr;
      }
    })().finally(() => {
      globalForPrisma.prismaReconnectPromise = null;
    });
  }

  await globalForPrisma.prismaReconnectPromise;
}

const prismaWithReconnect = basePrisma.$extends({
  query: {
    async $allOperations({ args, query, operation }) {
      try {
        return await query(args);
      } catch (error) {
        console.error(
          `[PRISMA] Erro na operação ${operation}:`,
          error instanceof Error ? error.message : String(error)
        );

        if (!isClosedConnectionError(error)) {
          throw error;
        }

        console.warn(
          "[PRISMA] 🔄 Erro de conexão detectado. Iniciando reconexão..."
        );

        try {
          await reconnectPrisma();
          console.log("[PRISMA] 🔄 Retry da operação após reconexão");
          return await query(args);
        } catch (retryError) {
          console.error(
            "[PRISMA] ❌ Falha no retry após reconexão:",
            retryError instanceof Error
              ? retryError.message
              : String(retryError)
          );
          throw error;
        }
      }
    },
  },
});

export const prisma = prismaWithReconnect as PrismaClient;

async function testConnection() {
  try {
    console.log("[PRISMA] 🧪 Testando conexão com banco...");
    await basePrisma.$connect();
    console.log("🟢 [PRISMA] ✅ Conectado ao banco com sucesso!");
  } catch (err) {
    console.error(
      "🔴 [PRISMA] ❌ Erro ao conectar ao banco:",
      err instanceof Error ? err.message : err
    );
    process.exit(1);
  }
}

testConnection();

export async function ensurePrismaConnection() {
  try {
    await reconnectPrisma();
    return true;
  } catch (error) {
    console.error("[PRISMA] Falha ao garantir conexão:", error);
    return false;
  }
}

export default prisma;