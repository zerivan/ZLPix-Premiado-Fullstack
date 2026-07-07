import React, { useEffect, useState, useRef } from "react";
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
import ResetPassword from "../pages/resetpassword";
import Manutencao from "../pages/manutencao";
import Anuncio from "../pages/anuncio";
import PoliticaPrivacidade from "../pages/politica-privacidade";
import TermosDeUso from "../pages/termos-de-uso";
import ExclusaoConta from "../pages/exclusao-conta";
import AcessoLegal from "../pages/acesso-legal";

// 🔥 NOVO
import ZLPPage from "../pages/zlp";

// 🔥 ADICIONADO (ROTA ROLETA)
import ZLPRoletaPage from "../pages/zlp-roleta";

// 🔥 CORREÇÃO: É COMPONENTE, NÃO PAGE
import AdminGanhadores from "../components/adminganhadores";

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
import ZLPRoletaOverlay from "../components/ZLPRoletaOverlay";
import ZLPOverlayAlerta from "../components/ZLPOverlayAlerta";
import { registerPush } from "../services/push";

function isUserLoggedIn() {
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

function isAdminLoggedIn() {
  return !!localStorage.getItem("TOKEN_ZLPIX_ADMIN");
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 🔥 CORRIGIDO: Adicionar delay mínimo para localStorage estabilizar
    const timer = setTimeout(() => {
      setReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <div className="p-6">Verificando login...</div>;
  }

  return isUserLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  const pushRegisteredRef = useRef(false);

  useEffect(() => {
    // 🔥 CORRIGIDO: Usar AbortController para cleanup
    let abortController = new AbortController();

    async function registerPushOnMount() {
      // 🔥 Evitar múltiplas chamadas (especialmente em Strict Mode)
      if (pushRegisteredRef.current) {
        console.log("⏭️ Push já foi registrado nesta sessão");
        return;
      }

      const token = localStorage.getItem("TOKEN_ZLPIX");
      if (!token) {
        console.log("⏭️ Usuário não autenticado, pulando push registration");
        return;
      }

      pushRegisteredRef.current = true;

      const userIdFromStorage = localStorage.getItem("USER_ID");
      const userFromStorage = localStorage.getItem("USER_ZLPIX");

      const parsedUserId = Number(userIdFromStorage);
      if (parsedUserId && !Number.isNaN(parsedUserId)) {
        console.log("📲 Registrando push com USER_ID:", parsedUserId);
        registerPush(parsedUserId);
        return;
      }

      if (userFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          const userId = Number(parsedUser?.id);
          if (userId && !Number.isNaN(userId)) {
            console.log("📲 Registrando push com parsed USER_ZLPIX:", userId);
            registerPush(userId);
          }
        } catch (err) {
          console.warn(
            "⚠️ Não foi possível ler USER_ZLPIX para push",
            err
          );
          pushRegisteredRef.current = false;
        }
      }
    }

    // 🔥 Aguardar um pouco para garantir que DOM está pronto
    const timer = setTimeout(() => {
      if (!abortController.signal.aborted) {
        registerPushOnMount();
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, []);

  return (
    <>
      <Routes>
        <Route
  path="/"
  element={
    isUserLoggedIn()
      ? <Navigate to="/home" replace />
      : <AcessoLegal />
  }
/>
        <Route path="/anuncio" element={<Anuncio />} />
        <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/exclusao-conta" element={<ExclusaoConta />} />

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/manutencao" element={<Manutencao />} />

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

        <Route
          path="/zlp"
          element={
            <PrivateRoute>
              <ZLPPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/zlp-roleta"
          element={
            <PrivateRoute>
              <ZLPRoletaPage />
            </PrivateRoute>
          }
        />

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

          <Route
            path="/admin/motor-manual"
            element={<AdminMotorManual />}
          />

          <Route
            path="/admin/ganhadores"
            element={<AdminGanhadores />}
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
      <ZLPOverlayAlerta />
      <ZLPRoletaOverlay />
    </>
  );
}