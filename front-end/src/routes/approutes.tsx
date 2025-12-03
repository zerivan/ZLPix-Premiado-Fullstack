// src/routes/approutes.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// 🧭 Páginas — nomes em minúsculo nos imports (compatível com Linux/Render)
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
 * 🧩 Verifica se o usuário está logado
 */
function isLoggedIn() {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("TOKEN_ZLPIX");
  } catch {
    return false;
  }
}

/**
 * 🔒 Rota privada — só acessa se estiver logado
 * Inclui delay pra evitar falsos negativos no localStorage
 */
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

  // Enquanto verifica login
  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-yellow-300">
        <p className="text-lg animate-pulse">Verificando login...</p>
      </div>
    );
  }

  // Se estiver logado, libera o acesso
  return authorized ? children : <Navigate to="/login" replace />;
}

/**
 * 🚪 Rota pública — impede login/cadastro se já estiver logado
 */
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

  // Se já está logado → vai pra Home, senão → mostra login/cadastro
  return authorized ? <Navigate to="/" replace /> : children;
}

/**
 * 🌍 Estrutura principal das rotas
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏠 Página inicial — privada */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      {/* 🔐 Autenticação */}
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

      {/* 💳 Pagamentos */}
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

      {/* ⚙️ Admin — sem bloqueio */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* 🚧 Fallback inteligente */}
      <Route
        path="*"
        element={
          isLoggedIn() ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}