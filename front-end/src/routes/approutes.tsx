import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import ApostaPainel from "../pages/apostapainel";
import MeusBilhetes from "../pages/meusbilhetes";
import Resultado from "../pages/resultado";
import Perfil from "../pages/perfil";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";
import PixPagamento from "../pages/pixpagamento";

// NOVA PÁGINA → Confirmação antes do PIX
import ConfirmarPagamento from "../pages/confirmar-pagamento";

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("TOKEN_ZLPIX");
      setAuthorized(!!token);
      setChecked(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-yellow-300">
        <p className="text-lg animate-pulse">Verificando login...</p>
      </div>
    );
  }

  return authorized ? children : <Navigate to="/" replace />;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("TOKEN_ZLPIX");
      setAuthorized(!!token);
      setChecked(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-yellow-300">
        <p className="text-lg animate-pulse">Carregando...</p>
      </div>
    );
  }

  return authorized ? <Navigate to="/home" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>

      {/* 🔑 Login explícito */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* 🔑 Página inicial = login */}
      <Route
        path="/"
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

      {/* ÁREA LOGADA */}
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

      {/* 💸 NOVA PÁGINA — Confirmação antes do PIX */}
      <Route
        path="/confirmar-pagamento"
        element={
          <PrivateRoute>
            <ConfirmarPagamento />
          </PrivateRoute>
        }
      />

      {/* 💸 Tela que mostra QR Code PIX */}
      <Route
        path="/pagamento"
        element={
          <PrivateRoute>
            <PixPagamento />
          </PrivateRoute>
        }
      />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Fallback */}
      <Route
        path="*"
        element={
          isLoggedIn() ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}