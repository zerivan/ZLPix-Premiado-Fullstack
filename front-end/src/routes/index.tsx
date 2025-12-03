import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import ApostaPainel from "../pages/apostapainel";
import MeusBilhetes from "../pages/meusbilhetes";
import Pagamento from "../pages/pagamento";
import PaymentSuccess from "../pages/payment-success";
import Resultado from "../pages/resultado";
import Perfil from "../pages/perfil";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";

/**
 * ✅ Verifica se o usuário está logado
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
            <Home />
          </PrivateRoute>
        }
      />

      {/* Autenticação */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/cadastro"
        element={
          <PublicRoute>
            <Cadastro />
          </PublicRoute>
        }
      />
      <Route
        path="/recuperar-senha"
        element={
          <PublicRoute>
            <RecuperarSenha />
          </PublicRoute>
        }
      />

      {/* Apostas */}
      <Route
        path="/aposta"
        element={
          <PrivateRoute>
            <ApostaPainel />
          </PrivateRoute>
        }
      />
      <Route
        path="/meus-bilhetes"
        element={
          <PrivateRoute>
            <MeusBilhetes />
          </PrivateRoute>
        }
      />

      {/* Pagamentos */}
      <Route
        path="/pagamento"
        element={
          <PrivateRoute>
            <Pagamento />
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamento/sucesso"
        element={
          <PrivateRoute>
            <PaymentSuccess />
          </PrivateRoute>
        }
      />

      {/* Resultados */}
      <Route
        path="/resultado"
        element={
          <PrivateRoute>
            <Resultado />
          </PrivateRoute>
        }
      />

      {/* Perfil */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />

      {/* Admin — público */}
      <Route path="/admin" element={<AdminLogin />} />

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