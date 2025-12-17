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
import Carteira from "../pages/carteira";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";

// Admin
import AdminRoute from "../components/adminroute";
import AdminDashboard from "../dashboard"; // ✅ CORRIGIDO (arquivo real do projeto)

// Auxiliares
import Revisao from "../pages/revisao";
import PixPagamento from "../pages/pixpagamento";

function isUserLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

function isAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("TOKEN_ZLPIX_ADMIN");
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [checked, setChecked] = React.useState(false);
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAuthorized(!!localStorage.getItem("TOKEN_ZLPIX"));
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
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

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isUserLoggedIn()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* 🔑 Público */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenha /></PublicRoute>} />

      {/* 👤 Usuário */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/aposta" element={<PrivateRoute><ApostaPainel /></PrivateRoute>} />
      <Route path="/meus-bilhetes" element={<PrivateRoute><MeusBilhetes /></PrivateRoute>} />
      <Route path="/resultado" element={<PrivateRoute><Resultado /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/carteira" element={<PrivateRoute><Carteira /></PrivateRoute>} />
      <Route path="/revisao" element={<PrivateRoute><Revisao /></PrivateRoute>} />
      <Route path="/pagamento" element={<PrivateRoute><PixPagamento /></PrivateRoute>} />

      {/* 🔐 Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* 🔁 Fallback */}
      <Route
        path="*"
        element={
          isAdminLoggedIn()
            ? <Navigate to="/admin/dashboard" replace />
            : isUserLoggedIn()
              ? <Navigate to="/home" replace />
              : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}