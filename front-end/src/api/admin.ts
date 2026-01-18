import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL ||
    "https://zlpix-premiado-fullstack.onrender.com") +
  "/api/admin";

export const adminApi = axios.create({
  baseURL,
});

// sempre envia o token do admin
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});