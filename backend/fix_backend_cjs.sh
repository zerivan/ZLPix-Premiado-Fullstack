#!/bin/bash

echo "🔧 Ajustando BACKEND para CommonJS (CJS)..."

# 1) Ajustar tsconfig.json
echo "🛠 Ajustando tsconfig.json..."
sed -i 's/"module": *"[^"]*"/"module": "CommonJS"/' tsconfig.json

# 2) Remover dist antigo
echo "🗑 Limpando dist..."
rm -rf dist

# 3) Reinstalar dependências (garante consistência)
echo "📦 Reinstalando dependências..."
npm install

# 4) Fazer o build novamente
echo "🏗 Criando novo build CJS..."
npm run build

echo "✨ Backend convertido para CJS com sucesso!"
echo
echo "🟢 Agora faça o PUSH:"
echo "git add -A && git commit -m 'fix: backend CJS build' && git push --force"
