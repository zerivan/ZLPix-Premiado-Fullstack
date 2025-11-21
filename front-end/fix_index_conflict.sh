#!/bin/bash

echo "🧼 Limpando conflito do index.html..."

cat << 'HTML' > index.html
<!DOCTYPE html>
<html lang="pt-BR" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ZLPIX PREMIADO</title>

    <!-- Fonte Spline Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <!-- Material Icons -->
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
      rel="stylesheet"
    />

    <!-- Tailwind + React (Vite) -->
    <script type="module" src="/src/main.jsx"></script>
  </head>

  <body
    class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display"
  >
    <div id="root"></div>
  </body>
</html>
HTML

echo "✔ Arquivo corrigido!"

git add index.html
git rebase --continue || echo "⚠ Rebase já finalizado ou não necessário."
