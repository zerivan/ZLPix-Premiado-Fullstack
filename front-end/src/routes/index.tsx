import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas
import home from "../pages/home";
import login from "../pages/login";
import cadastro from "../pages/cadastro";
import apostapainel from "../pages/apostapainel";
import meusbilhetes from "../pages/meusbilhetes";
import pagamento from "../pages/pagamento";
import paymentsuccess from "../pages/payment-success";
import resultado from "../pages/resultado";
import perfil from "../pages/perfil";
import adminlogin from "../pages/adminlogin";
import recuperarsenha from "../pages/recuperar-senha";

/**
 * ✅ Verifica se o usuário está logado
 * Usa typeof window pra evitar erro no build (SSR ou Render)
 */
function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("TOKEN_ZLPIX"));
}

/**
 * 🔒 Rota privada — só acessa logado
 */
function PrivateRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

/**
 * 🚪 Rota pública — impede acessar login/cadastro se já logado
 */
function PublicRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? <Navigate to="/" replace /> : children;
}

/**
 * 🌐 Estrutura principal de rotas
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Página inicial protegida */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <home />
          </PrivateRoute>
        }
      />

      {/* Autenticação */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <login />
          </PublicRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PublicRoute>
            <cadastro />
          </PublicRoute>
        }
      />
      <Route
        path="/recuperar-senha"
        element={
          <PublicRoute>
            <recuperarsenha />
          </PublicRoute>
        }
      />

      {/* Apostas */}
      <Route
        path="/aposta"
        element={
          <PrivateRoute>
            <apostapainel />
          </PrivateRoute>
        }
      />
      <Route
        path="/meus-bilhetes"
        element={
          <PrivateRoute>
            <meusbilhetes />
          </PrivateRoute>
        }
      />

      {/* Pagamentos */}
      <Route
        path="/pagamento"
        element={
          <PrivateRoute>
            <pagamento />
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamento/sucesso"
        element={
          <PrivateRoute>
            <paymentsuccess />
          </PrivateRoute>
        }
      />

      {/* Resultados */}
      <Route
        path="/resultado"
        element={
          <PrivateRoute>
            <resultado />
          </PrivateRoute>
        }
      />

      {/* Perfil */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <perfil />
          </PrivateRoute>
        }
      />

      {/* Admin — público */}
      <Route path="/admin" element={<adminlogin />} />

      {/* 🚧 Fallback inteligente */}
      <Route
        path="*"
        element={
          isLoggedIn() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}