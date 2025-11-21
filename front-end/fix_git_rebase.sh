#!/bin/bash

echo "🔧 Corrigindo rebase travado..."

# Ajustar editor pra evitar erros
git config core.editor true

# Se estiver em rebase, resolver
if git status | grep -q "interactive rebase in progress"; then
    echo "📌 Rebase detectado. Marcando index.html como resolvido..."
    git add index.html

    echo "📌 Continuando o rebase..."
    git rebase --continue -m "fix(frontend): resolvendo conflito do index.html"

    if [ $? -eq 0 ]; then
        echo "✅ Rebase finalizado com sucesso!"
    else
        echo "❌ Erro ao continuar o rebase."
        exit 1
    fi
else
    echo "👍 Nenhum rebase travado encontrado."
fi

echo "🔍 Estado final:"
git status
