@tailwind base;
@tailwind components;
@tailwind utilities;

/* 🎨 Estilos globais do ZLPix Premiado */
body {
  @apply bg-dark text-white font-sans antialiased flex items-center justify-center min-h-screen;
}

button {
  @apply transition-transform duration-200 ease-in-out;
}

button:hover {
  @apply scale-105;
}

/* 🎁 Animação suave de entrada */
.fade-in {
  animation: fadeIn 0.8s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}