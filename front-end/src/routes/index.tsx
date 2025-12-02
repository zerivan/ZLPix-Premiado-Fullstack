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
 * ✅ Função segura para verificar autenticação
 * Evita erro no build do Render (que não tem `localStorage` durante o build)
 */
function isLoggedIn() {
  if (typeof window === "undefined") return false; // 🔥 Garante que só roda no navegador
  return Boolean(localStorage.getItem("TOKEN_ZLPIX"));
}

/**
 * 🔒 Wrapper para rotas privadas (só acessa logado)
 */
function PrivateRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

/**
 * 🚪 Wrapper para rotas públicas (bloqueia login/cadastro se já logado)
 */
function PublicRoute({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? <Navigate to="/" replace /> : children;
}

/**
 * 🧭 Estrutura principal de rotas
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🌟 Rota inicial */}
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />

      {/* 🔐 Autenticação */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
      <Route path="/recuperar-senha" element={<PublicRoute><RecuperarSenha /></PublicRoute>} />

      {/* 💰 Apostas */}
      <Route path="/aposta" element={<PrivateRoute><ApostaPainel /></PrivateRoute>} />
      <Route path="/meus-bilhetes" element={<PrivateRoute><MeusBilhetes /></PrivateRoute>} />

      {/* 💳 Pagamentos */}
      <Route path="/pagamento" element={<PrivateRoute><Pagamento /></PrivateRoute>} />
      <Route path="/pagamento/sucesso" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />

      {/* 🏆 Resultados */}
      <Route path="/resultado" element={<PrivateRoute><Resultado /></PrivateRoute>} />

      {/* 👤 Perfil */}
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />

      {/* ⚙️ Admin */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* 🚧 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}