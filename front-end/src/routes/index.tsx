import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/approutes"; // ✅ apenas mudou o nome

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes /> {/* ✅ componente React válido */}
    </BrowserRouter>
  </React.StrictMode>
);