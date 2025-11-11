import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

import { api } from "./api/client";

api.get("/")
  .then(() => console.log("✅ Conectado ao backend com sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar ao backend:", err.message));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
