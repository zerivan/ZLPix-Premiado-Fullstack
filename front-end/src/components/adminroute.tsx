import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

/**
 * 🔐 Proteção de rota ADMIN
 * - Verifica se existe TOKEN_ZLPIX_ADMIN
 * - Se não existir, redireciona para /admin
 */
export default function AdminRoute({ children }: Props) {
  const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}