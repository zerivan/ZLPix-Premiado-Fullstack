#!/bin/bash
set -e

echo "🔧 Corrigindo ambiente de build no Render..."

# Limpa possíveis caches e artefatos quebrados
rm -rf dist node_modules
npm cache clean --force

echo "📦 Instalando dependências (incluindo @types)..."
npm install --production=false
npm install --save-dev @types/node @types/express @types/cors @types/qrcode

echo "⚙️ Gerando Prisma Client..."
npx prisma generate

echo "🏗️ Compilando TypeScript..."
npx tsc -p tsconfig.build.json

echo "✅ Build finalizado com sucesso!"