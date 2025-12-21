#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🔥 FIX ADMIN PANEL — ZLPIX (MODO CIRÚRGICO)"

ROOT=$(pwd)
FRONT="$ROOT/front-end"

echo "📁 Verificando adminApi..."

ADMIN_API="$FRONT/src/api/admin.ts"

if [ ! -f "$ADMIN_API" ]; then
cat << 'EOT' > "$ADMIN_API"
import axios from "axios";

export const adminApi = axios.create({
  baseURL: "https://zlpix-premiado-fullstack.onrender.com",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});
EOT
fi

echo "🔧 Corrigindo componentes ADMIN..."

FILES=(
  aparenciacontrol.tsx
  conteudocontrol.tsx
  usuarioscontrol.tsx
  relatorioscontrol.tsx
  admindiagnosticoia.tsx
)

for f in "${FILES[@]}"; do
  FILE="$FRONT/src/components/$f"
  if [ -f "$FILE" ]; then
    sed -i '/api\/client/d' "$FILE"
    sed -i '1i import { adminApi } from "../api/admin";' "$FILE"
    sed -i 's/\bapi\./adminApi./g' "$FILE"
  fi
done

echo "🔁 Ajustando CMS..."
sed -i 's|/api/admin/content|/api/admin/cms/content|g' \
"$FRONT/src/components/conteudocontrol.tsx"

echo "🧹 Limpando cache..."
cd "$FRONT"
rm -rf node_modules .vite dist

echo "📦 Instalando dependências..."
npm install

echo "🏗️ Buildando frontend..."
npm run build

echo "✅ PAINEL ADMIN AJUSTADO COM SUCESSO"
