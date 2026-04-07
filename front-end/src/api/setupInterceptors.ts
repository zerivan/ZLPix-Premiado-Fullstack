import axios from "axios";

let maintenanceInterceptorConfigured = false;

export function setupGlobalAxiosInterceptors() {
  if (maintenanceInterceptorConfigured) return;

  maintenanceInterceptorConfigured = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 503 && typeof window !== "undefined") {
        const path = window.location.pathname;

        // 🔥 NÃO bloquear rotas do admin
        if (path.startsWith("/admin")) {
          return Promise.reject(error);
        }

        if (path !== "/manutencao") {
          window.location.href = "/manutencao";
        }
      }

      return Promise.reject(error);
    }
  );
}