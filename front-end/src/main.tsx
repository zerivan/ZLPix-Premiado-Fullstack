// src/main.tsx
import ReactDOM from "react-dom/client";
import "./styles/index.css";

import { api } from "./api/client";
import AppRoutes from "./routes/approutes";

import { BrowserRouter } from "react-router-dom";

api.get("/")
  .then(() => console.log("✅ Conectado ao backend com sucesso!"))
  .catch((err) =>
    console.error("❌ Erro ao conectar ao backend:", err.message)
  );

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);