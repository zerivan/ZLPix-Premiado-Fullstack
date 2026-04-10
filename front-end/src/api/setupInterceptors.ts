import axios from "axios";

let maintenanceInterceptorConfigured = false;

export function setupGlobalAxiosInterceptors() {
  if (maintenanceInterceptorConfigured) return;

  maintenanceInterceptorConfigured = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const requestUrl = error?.config?.url || "";

      if (status === 503 && typeof window !== "undefined") {
        const path = window.location.pathname;

        // 🔥 NÃO bloquear admin (rota e API)
        if (
          path.startsWith("/admin") ||
          requestUrl.includes("/api/admin")
        ) {
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