import axios from "axios";

let maintenanceInterceptorConfigured = false;

export function setupGlobalAxiosInterceptors() {
  if (maintenanceInterceptorConfigured) return;

  maintenanceInterceptorConfigured = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const requestUrl = String(error?.config?.url || "");

      if (status === 503 && typeof window !== "undefined") {
        const currentPath = window.location.pathname || "";
        const isAdminPage = currentPath === "/admin" || currentPath.startsWith("/admin/");
        const isAdminApiRequest =
          requestUrl.includes("/api/admin") || requestUrl.startsWith("/admin/");

        // 🔥 NÃO bloquear admin (rota e API)
        if (isAdminPage || isAdminApiRequest) {
          return Promise.reject(error);
        }

        if (currentPath !== "/manutencao") {
          window.location.href = "/manutencao";
        }
      }

      return Promise.reject(error);
    }
  );
}