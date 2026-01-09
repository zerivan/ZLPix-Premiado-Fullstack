/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: "#FFD700",
        emerald: "#10B981",
        ocean: "#0077B6",
        dark: "#0D1117",
        background: {
          light: "#F5F9FF",
          dark: "#0D1117"
        }
      },
      gradientColorStops: {
        primary: "#3B82F6", // azul principal
        secondary: "#10B981", // verde esmeralda
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 215, 0, 0.3)",
        innerGlow: "inset 0 0 10px rgba(16, 185, 129, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse-slow 2.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
