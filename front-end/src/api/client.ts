import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://zlpix-premiado-fullstack.onrender.com";

export const api = axios.create({
  baseURL,
});

// 🔐 INTERCEPTOR DE AUTENTICAÇÃO (CORRIGIDO)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_ZLPIX");

  const url = config.url || "";

  // 🔓 ROTAS PÚBLICAS — NÃO DEVEM RECEBER TOKEN
  const isPublic =
    url.startsWith("/api/cms/public") ||
    url.startsWith("/api/federal") ||
    url.startsWith("/auth/login") ||
    url.startsWith("/auth/register");

  if (token && !isPublic) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});