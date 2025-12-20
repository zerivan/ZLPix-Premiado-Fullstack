import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  (location.hostname === "localhost" || location.hostname.startsWith("10.")
    ? "http://localhost:4000"
    : "https://zlpix-premiado-fullstack.onrender.com");

export const api = axios.create({
  baseURL,
});

// 🔐 Interceptor para anexar token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    const userToken = localStorage.getItem("TOKEN_ZLPIX");

    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});