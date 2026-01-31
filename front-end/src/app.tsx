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
import AddCreditos from "../pages/add-creditos";
import PixCarteira from "../pages/pix-carteira";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha";
import Anuncio from "../pages/anuncio";
import PoliticaPrivacidade from "../pages/politica-privacidade";
import TermosDeUso from "../pages/termos-de-uso";

// 🔥 CORREÇÃO: Motor Manual agora está em components
import AdminMotorManual from "../components/adminmotormanual";

// Admin
import AdminRoute from "../components/adminroute";
import AdminDashboard from "../admindashboard";

// Auxiliares
import Revisao from "../pages/revisao";
import PixPagamento from "../pages/pixpagamento";
import DynamicPage from "../pages/dynamicpage";

// 🔥 Chat Global
import GlobalChatBot from "../components/GlobalChatBot";

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

  if (!ready) {
    return <div className="p-6">Verificando login...</div>;
  }

  return isUserLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/anuncio" element={<Anuncio />} />
        <Route
          path="/politica-privacidade"
          element={<PoliticaPrivacidade />}
        />
        <Route
          path="/termos-de-uso"
          element={<TermosDeUso />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />

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
          path="/add-creditos"
          element={
            <PrivateRoute>
              <AddCreditos />
            </PrivateRoute>
          }
        />

        <Route path="/pix-carteira" element={<PixCarteira />} />

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

        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin/admindashboard" replace />}
        />

        <Route element={<AdminRoute />}>
          <Route
            path="/admin/admindashboard"
            element={<AdminDashboard />}
          />

          {/* 🔥 Motor Manual */}
          <Route
            path="/admin/motor-manual"
            element={<AdminMotorManual />}
          />
        </Route>

        <Route
          path="/p/:slug"
          element={
            isAdminLoggedIn() || isUserLoggedIn() ? (
              <DynamicPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <GlobalChatBot />
    </>
  );
}