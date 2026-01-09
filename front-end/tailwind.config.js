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
          dark: "#0D1117",
        },
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
      // 💅 Personalização da tipografia (plugin @tailwindcss/typography)
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.800"),
            a: {
              color: theme("colors.blue.600"),
              "&:hover": { color: theme("colors.blue.800") },
              textDecoration: "underline",
            },
            h1: {
              color: theme("colors.ocean"),
              fontWeight: "700",
              borderBottom: "2px solid " + theme("colors.emerald"),
              paddingBottom: "0.3em",
            },
            h2: {
              color: theme("colors.emerald"),
              fontWeight: "600",
              marginTop: "1.2em",
            },
            h3: {
              color: theme("colors.ocean"),
              fontWeight: "600",
            },
            strong: { color: theme("colors.dark") },
            code: {
              backgroundColor: theme("colors.gray.100"),
              color: theme("colors.ocean"),
              padding: "2px 4px",
              borderRadius: "4px",
            },
            blockquote: {
              borderLeftColor: theme("colors.emerald"),
              color: theme("colors.gray.700"),
              fontStyle: "italic",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.gold"),
              "&:hover": { color: theme("colors
