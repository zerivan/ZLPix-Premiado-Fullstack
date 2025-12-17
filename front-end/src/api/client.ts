import axios from "axios";

export const api = axios.create({
  baseURL: "https://zlpix-premiado-fullstack.onrender.com",
});

// 🔐 Interceptor para anexar token automaticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // prioridade: ADMIN
    const adminToken = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    const userToken = localStorage.getItem("TOKEN_ZLPIX");

    const token = adminToken || userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});