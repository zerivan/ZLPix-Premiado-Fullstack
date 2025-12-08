#!/bin/bash
set -e

echo "🔥 Limpando build antigo..."
rm -rf dist
rm -rf node_modules/.prisma

echo "🔥 Regenerando Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "🔥 Aplicando migrations FORÇADAS no banco Neon..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "🔥 Recriando build do TypeScript..."
npx tsc -p tsconfig.json

echo "🔥 Finalizado. Render pode rodar com sucesso."