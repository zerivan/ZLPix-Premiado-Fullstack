// src/routes/index.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// páginas (use exatamente os nomes de arquivo presentes em src/pages)
import Home from "../pages/home";
import Login from "../pages/login";
import Cadastro from "../pages/cadastro";
import ApostaPainel from "../pages/apostapainel";
import MeusBilhetes from "../pages/meusbilhetes";
import Pagamento from "../pages/pagamento";
import PaymentSuccess from "../pages/payment-success";
import Resultado from "../pages/resultado";
import AdminLogin from "../pages/adminlogin";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />

      {/* App */}
      <Route path="/aposta" element={<ApostaPainel />} />
      <Route path="/meus-bilhetes" element={<MeusBilhetes />} />
      <Route path="/pagamento" element={<Pagamento />} />
      <Route path="/pagamento/sucesso" element={<PaymentSuccess />} />
      <Route path="/resultado" element={<Resultado />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* fallback: redirecionar para home (opcional) */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
