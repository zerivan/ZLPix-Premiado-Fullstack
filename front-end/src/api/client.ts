import axios from "axios";

// Detecta ambiente automaticamente
const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";

export const api = axios.create({
  baseURL: isLocal
    ? "http://localhost:4000" 
    : "https://zlpix-premiado-fullstack.onrender.com", // ← CORRETO
  timeout: 5000,
});