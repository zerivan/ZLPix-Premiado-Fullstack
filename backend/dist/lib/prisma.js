const { PrismaClient } = require("@prisma/client");

let prisma;

try {
  prisma = new PrismaClient();
  console.log("🟢 Prisma conectado ao banco com sucesso.");
} catch (err) {
  console.error("🔴 Erro ao conectar ao Prisma:", err);
  prisma = null;
}

module.exports = prisma;