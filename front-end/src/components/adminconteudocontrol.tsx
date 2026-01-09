import { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify"; // 🔒 Sanitização do HTML

type CmsArea = {
  key: string;
  title: string;
  contentHtml: string;
};

type CmsPage = {
  page: string;
  title: string;
};

export default function AdminConteudoControl() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [pageKey, setPageKey] = useState<string>("");

  const [areas, setAreas] = useState<CmsArea[]>([]);
  const [activeArea, setActiveArea] = useState<CmsArea | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  function getHeaders() {
    const token = localStorage.getItem("TOKEN_ZLPIX_ADMIN");
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  }

  // =========================
  // LOAD PÁGINAS
  // =========================
  async function loadPages() {
    try {
      const headers = getHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/cms/pages`, {
        headers,
      });

      if (res.data?.ok && Array.isArray(res.data.pages)) {
        setPages(res.data.pages);
        if (res.data.pages.length > 0) {
          setPageKey(res.data.pages[0].page);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar páginas:", err);
      setErro("Erro ao carregar páginas.");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD ÁREAS DA PÁGINA
  // =========================
  async function loadAreas(page: string) {
    try {
      setLoadingAreas(true);
      setActiveArea(null);
      setErro(null);

      const headers = getHeaders();
      if (!headers) {
        setErro("Token de administrador ausente.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/admin/cms/areas/${page}`, {
        headers,
      });

      if (res.data?.ok && Array.isArray(res.data.areas)) {
        setAreas(res.data.areas);
      } else {
        setAreas([]);
      }
    } catch (err) {
      console.error("Erro ao carregar áreas:", err);
      setErro("Erro ao carregar áreas.");
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }

  // ============
