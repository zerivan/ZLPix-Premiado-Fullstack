import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminPagesRouter() {
  const { page } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");

    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Ativa modo CMS (flag simples)
    sessionStorage.setItem("CMS_MODE", "true");

    // Mapeamento página CMS → rota real
    const map: Record<string, string> = {
      home: "/",
      resultado: "/resultado",
      ajuda: "/ajuda",
      perfil: "/perfil",
    };

    const target = map[page || "home"];

    if (!target) {
      navigate("/admin");
      return;
    }

    navigate(target, { replace: true });
  }, [page, navigate]);

  return null;
}