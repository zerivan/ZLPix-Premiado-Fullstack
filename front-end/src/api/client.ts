import axios from "axios";

// Detecta ambiente automaticamente
const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

export const api = axios.create({
  baseURL: isLocal
    ? "http://localhost:4000"        // Ambiente local
    : "https://zlpix-backend.onrender.com", // Produção Render
  timeout: 5000,
});