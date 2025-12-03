// src/routes/approutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas — importações todas em minúsculo (compatível com Render/Linux)
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

// ✅ Função auxiliar pra verificar login
function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

// 🔒 Rotas privadas
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

// 🚪 Rotas públicas
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

  // Se estiver logado → vai pra home
  return authorized ? <Navigate to="/home" replace /> : children;
}

// 🌍 Estrutura principal das rotas
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏁 Página inicial (login) */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* 🧾 Cadastro */}
      <Route
        path="/cadastro"
        element={
          <PublicRoute>
            <Cadastro />
          </PublicRoute>
        }
      />

      {/* 🔑 Recuperar senha */}
      <Route
        path="/recuperar-senha"
        element={
          <PublicRoute>
            <RecuperarSenha />
          </PublicRoute>
        }
      />

      {/* 🏠 Home — protegida */}
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* 🎯 Apostas */}
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

      {/* 💳 Pagamento */}
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

      {/* 🏆 Resultados */}
      <Route
        path="/resultado"
        element={
          <PrivateRoute>
            <Resultado />
          </PrivateRoute>
        }
      />

      {/* 👤 Perfil */}
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />

      {/* ⚙️ Admin */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* 🚧 Fallback — qualquer rota inválida */}
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