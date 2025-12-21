import axios from "axios";

export const adminApi = axios.create({
  baseURL: "https://zlpix-premiado-fullstack.onrender.com",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});
