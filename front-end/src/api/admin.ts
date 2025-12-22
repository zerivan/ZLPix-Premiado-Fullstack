import axios from "axios";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
});

// sempre envia o token do admin
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});