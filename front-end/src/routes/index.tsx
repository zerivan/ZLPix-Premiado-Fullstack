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
import Perfil from "../pages/perfil";
import AdminLogin from "../pages/adminlogin";
import RecuperarSenha from "../pages/recuperar-senha"; // 🔥 ADICIONADO

function isLoggedIn() {
  return !!localStorage.getItem("TOKEN_ZLPIX");
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn() ? <Home /> : <Navigate to="/login" />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* 🔥 NOVO - PÁGINA LIVRE */}
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />

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

      <Route path="/admin" element={<AdminLogin />} />

      <Route path="*" element={<Navigate to="/" />} />
    <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}