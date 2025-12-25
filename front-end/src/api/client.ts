import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "https://serious-mead-zlpix-premiado-284414d9.koyeb.app";

export const api = axios.create({
  baseURL,
});

// segurança extra (não interfere no admin)
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  return config;
});