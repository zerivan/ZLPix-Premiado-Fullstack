// src/pages/perfil.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBottom from "../components/navbottom";

export default function Perfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("TOKEN_ZLPIX");
      const userData = localStorage.getItem("USER_ZLPIX");

      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("TOKEN_ZLPIX");
    localStorage.removeItem("USER_ZLPIX");
    navigate("/login");
  };

  function handleSelecionarImagem() {
    fileInputRef.current?.click();
  }

  function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecione uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      const userAtualizado = {
        ...user,
        avatar: base64,
      };

      setUser(userAtualizado);
      localStorage.setItem("USER_ZLPIX", JSON.stringify(userAtualizado));
    };

    reader.readAsDataURL(file);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white">
        <p className="text-lg animate-pulse">Carregando perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white p-5 text-center">
        <h2 className="text-xl font-bold mb-4">Sessão expirada ⚠️</h2>
        <p className="mb-6 text-yellow-200">
          Não conseguimos carregar suas informações. Faça login novamente.
        </p>
        <button
          onClick={handleLogout}
          className="bg-yellow-400 text-blue-900 font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition"
        >
          Fazer login novamente
        </button>
      </div>
    );
  }

  const getSafeDate = (dateString?: string) => {
    if (!dateString) return null;
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) return null;
    return parsedDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const createdAtFormatted = getSafeDate(user.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-green-800 text-white flex flex-col pb-24">
      <div className="flex-1 w-full max-w-xl mx-auto px-6 pt-6">

        <header className="flex flex-col items-center mb-8">
          <div className="relative">

            {/* AVATAR */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-300 to-green-400 flex items-center justify-center text-blue-900 text-5xl font-extrabold shadow-2xl border-4 border-white/30">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}

            {/* BOTÃO EDITAR */}
            <div
              onClick={handleSelecionarImagem}
              className="absolute bottom-1 right-1 bg-yellow-400 p-1.5 rounded-full border border-blue-900 cursor-pointer shadow-md hover:scale-105 transition-transform"
            >
              ✏️
            </div>

            {/* INPUT OCULTO */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImagemChange}
              className="hidden"
            />
          </div>

          <h1 className="text-2xl font-bold mt-4">
            {user.name || "Usuário"}
          </h1>
          <p className="text-sm text-yellow-300">{user.email}</p>
        </header>

        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-lg mb-6 space-y-3 text-sm">

          {user.id && (
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/70">ID do usuário</span>
              <span className="font-semibold text-yellow-300">
                #{user.id}
              </span>
            </div>
          )}

          <div className="flex justify-between border-b border-white/10 pb-1">
            <span className="text-white/70">Nome</span>
            <span className="font-semibold text-yellow-300">
              {user.name}
            </span>
          </div>

          <div className="flex justify-between border-b border-white/10 pb-1">
            <span className="text-white/70">E-mail</span>
            <span className="font-semibold text-yellow-300">
              {user.email}
            </span>
          </div>

          {user.phone && (
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/70">Telefone</span>
              <span className="font-semibold text-yellow-300">
                {user.phone}
              </span>
            </div>
          )}

          {user.pixKey && (
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span className="text-white/70">Chave PIX</span>
              <span className="font-semibold text-yellow-300">
                {user.pixKey}
              </span>
            </div>
          )}

          {createdAtFormatted && (
            <div className="flex justify-between">
              <span className="text-white/70">Conta criada em</span>
              <span className="font-semibold text-yellow-300">
                {createdAtFormatted}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Sair da Conta
        </button>
      </div>

      <NavBottom />
    </div>
  );
}