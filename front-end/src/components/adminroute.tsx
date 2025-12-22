import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * 🔐 Proteção de rota ADMIN (robusta)
 * - Revalida token a cada mudança de rota
 * - Corrige refresh quebrado
 * - Corrige logout que não sai do painel
 */
function isAdminLoggedIn() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
  return typeof token === "string" && token.length > 10;
}

export default function AdminRoute() {
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 🔁 revalida SEMPRE que a rota muda
    setAuthorized(isAdminLoggedIn());
  }, [location.pathname]);

  // ⏳ enquanto valida
  if (authorized === null) {
    return <div className="p-6">Verificando acesso administrativo...</div>;
  }

  // 🚫 sem token → volta pro login admin
  if (!authorized) {
    return <Navigate to="/admin" replace />;
  }

  // ✅ autorizado → libera painel
  return <Outlet />;
}