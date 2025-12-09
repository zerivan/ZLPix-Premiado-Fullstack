#!/bin/bash
echo "🔧 Limpando e padronizando o front-end..."

BASE="src"

echo "🗑 Removendo arquivos proibidos (acentos, duplicações, etc)..."
find $BASE -type f -regex '.*[ÁÀÂÃÉÈÊÍÌÓÒÔÕÚÙÇáàâãéèêíìóòôõúùç ].*' -delete

echo "🧹 Removendo duplicados .jsx onde existir versão .tsx..."
for f in $(find $BASE -type f -name "*.jsx"); do
  tsx="${f%.jsx}.tsx"
  if [ -f "$tsx" ]; then
    echo "❌ Arquivo duplicado removido: $f"
    rm -f "$f"
  fi
done

echo "♻ Convertendo arquivos .jsx restantes para .tsx..."
for f in $(find $BASE -type f -name "*.jsx"); do
  novo="${f%.jsx}.tsx"
  echo "➡ $f → $novo"
  mv "$f" "$novo"
done

echo "🔍 Ajustando imports..."
find $BASE -type f -name "*.tsx" -exec sed -i 's#\./App#\./app#gI' {} \;

sed -i 's/AdminLoginModal/adminloginmodal/gI' $BASE/**/*.tsx 2>/dev/null
sed -i 's/AdminDashboard/admindashboard/gI' $BASE/**/*.tsx 2>/dev/null
sed -i 's/ApostaPainel/apostapainel/gI'     $BASE/**/*.tsx 2>/dev/null
sed -i 's/ApostaPanel/apostapanel/gI'       $BASE/**/*.tsx 2>/dev/null

echo "🔧 Ajustando main.tsx..."
sed -i 's#./App#./app#gI' $BASE/main.tsx

echo "📦 Estrutura FINAL:"
find $BASE -type f | sort

echo "✨ Front-end padronizado!"
echo "🚀 Rode depois:"
echo "npm install"
echo "npm run build"
