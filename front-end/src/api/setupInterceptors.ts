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
        if (window.location.pathname !== "/manutencao") {
          window.location.href = "/manutencao";
        }
      }

      return Promise.reject(error);
    }
  );
}