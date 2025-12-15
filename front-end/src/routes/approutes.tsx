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
import Carteira from "../pages/carteira"; // ✅ NOVO
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";

// PÁGINA REAL DE REVISÃO DOS BILHETES
import Revisao from "../pages/revisao";

// PÁGINA QUE MOSTRA QR CODE / CHAVE PIX
import PixPagamento from "../pages/pixpagamento";

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

      {/* 🔑 Login */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenha /></PublicRoute>} />

      {/* 🔒 ÁREA LOGADA */}
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/aposta" element={<PrivateRoute><ApostaPainel /></PrivateRoute>} />
      <Route path="/meus-bilhetes" element={<PrivateRoute><MeusBilhetes /></PrivateRoute>} />
      <Route path="/resultado" element={<PrivateRoute><Resultado /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/carteira" element={<PrivateRoute><Carteira /></PrivateRoute>} /> {/* ✅ NOVO */}

      {/* 🧾 REVISÃO */}
      <Route path="/revisao" element={<PrivateRoute><Revisao /></PrivateRoute>} />

      {/* 💸 PAGAMENTO PIX */}
      <Route path="/pagamento" element={<PrivateRoute><PixPagamento /></PrivateRoute>} />

      {/* ADMIN */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Fallback */}
      <Route
        path="*"
        element={
          isLoggedIn()
            ? <Navigate to="/home" replace />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
}