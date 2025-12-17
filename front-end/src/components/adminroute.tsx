import { Navigate, Outlet } from "react-router-dom";

/**
 * 🔐 Proteção de rota ADMIN (React Router v6)
 * - Verifica se existe TOKEN_ZLPIX_ADMIN
 * - Se não existir, redireciona para /admin
 * - Se existir, libera acesso às rotas filhas
 */
export default function AdminRoute() {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}