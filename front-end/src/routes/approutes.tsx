import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import ApostaPainel from "../pages/apostapainel";
import MeusBilhetes from "../pages/meusbilhetes";
import Resultado from "../pages/resultado";
import Perfil from "../pages/perfil";
import Carteira from "../pages/carteira";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";

// Admin
import AdminRoute from "../components/adminroute";
import AdminDashboard from "../admindashboard";

// Auxiliares
import Revisao from "../pages/revisao";
import PixPagamento from "../pages/pixpagamento";
import DynamicPage from "../pages/dynamicpage";

/**
 * ============================
 * HELPERS DE AUTH
 * ============================
 */
function isUserLoggedIn() {
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

function isAdminLoggedIn() {
  return !!localStorage.getItem("TOKEN_ZLPIX_ADMIN");
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return <div className="p-6">Verificando login...</div>;

  return isUserLoggedIn() ? children : <Navigate to="/login" replace />;
}

/**
 * ============================
 * ROTAS
 * ============================
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* HOME PÚBLICA */}
      <Route path="/" element={<Home />} />

      {/* Auth usuário */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />

      {/* Usuário logado */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
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
      <Route
        path="/resultado"
        element={
          <PrivateRoute>
            <Resultado />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route
        path="/carteira"
        element={
          <PrivateRoute>
            <Carteira />
          </PrivateRoute>
        }
      />
      <Route
        path="/revisao"
        element={
          <PrivateRoute>
            <Revisao />
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamento"
        element={
          <PrivateRoute>
            <PixPagamento />
          </PrivateRoute>
        }
      />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />

      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* CMS DINÂMICO — NUNCA INTERCEPTA ADMIN */}
      <Route
        path="/:slug"
        element={
          (() => {
            const slug = window.location.pathname.replace("/", "");

            // 🚫 BLOQUEIO ABSOLUTO DE ROTAS ADMIN
            if (slug.startsWith("admin")) {
              return <Navigate to="/admin" replace />;
            }

            return isAdminLoggedIn() || isUserLoggedIn() ? (
              <DynamicPage />
            ) : (
              <Navigate to="/login" replace />
            );
          })()
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}