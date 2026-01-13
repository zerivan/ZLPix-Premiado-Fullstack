import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔐 INTERCEPTOR DE AUTENTICAÇÃO
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_ZLPIX");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://zlpix-premiado-fullstack.onrender.com";

export const api = axios.create({
  baseURL,
});

// segurança extra (não interfere no admin)
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  return config;
});
