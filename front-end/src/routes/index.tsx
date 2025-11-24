// src/routes/index.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// páginas
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import ApostaPainel from "../pages/apostapainel";
import MeusBilhetes from "../pages/meusbilhetes";
import Pagamento from "../pages/pagamento";
import PaymentSuccess from "../pages/payment-success";
import Resultado from "../pages/resultado";
import AdminLogin from "../pages/adminlogin";

// 👉 função simples pra simular se o usuário está logado
function isLoggedIn() {
  return localStorage.getItem("TOKEN_ZLPIX") ? true : false;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* SE NÃO ESTIVER LOGADO → LOGIN */}
      <Route
        path="/"
        element={isLoggedIn() ? <Home /> : <Navigate to="/login" />}
      />

      {/* login sempre abre */}
      <Route path="/login" element={<Login />} />

      {/* cadastro sempre abre */}
      <Route path="/cadastro" element={<Cadastro />} />

      {/* telas que só funcionam se logado */}
      <Route
        path="/aposta"
        element={isLoggedIn() ? <ApostaPainel /> : <Navigate to="/login" />}
      />

      <Route
        path="/meus-bilhetes"
        element={isLoggedIn() ? <MeusBilhetes /> : <Navigate to="/login" />}
      />

      <Route
        path="/pagamento"
        element={isLoggedIn() ? <Pagamento /> : <Navigate to="/login" />}
      />

      <Route
        path="/pagamento/sucesso"
        element={isLoggedIn() ? <PaymentSuccess /> : <Navigate to="/login" />}
      />

      <Route
        path="/resultado"
        element={isLoggedIn() ? <Resultado /> : <Navigate to="/login" />}
      />

      {/* admin — livre por enquanto */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}