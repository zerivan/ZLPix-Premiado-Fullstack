import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000;
const ASSISTANT_NAME = "Dayane";

// ✅ AVATAR LOCAL (public/assets/avatar.png)
const AVATAR_URL = "/assets/avatar.png";

const GlobalChatBot: React.FC = () => {
  const location = useLocation();

  const hiddenPages = [
    "/login",
    "/cadastro",
    "/recuperar-senha",
    "/politica-privacidade",
    "/termos-de-uso",
    "/exclusao-conta",
  ];

  const [showAvatar, setShowAvatar] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const timerRef = useRef<number | null>(null);

  // 🔥 CORRIGIDO: useCallback para evitar recreação de função
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setShowAvatar((prev) => (!openChat && !prev ? true : prev));
    }, INACTIVITY_TIME);
  }, [openChat]);

  useEffect(() => {
    // 🔥 CORRIGIDO: Mover lógica condicional para dentro do effect
    if (hiddenPages.includes(location.pathname)) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      setShowAvatar(false);
      setOpenChat(false);
      return;
    }

    resetTimer();

    const handleActivity = () => {
      if (!openChat) {
        setShowAvatar(false);
        resetTimer();
      }
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }

      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [openChat, location.pathname, hiddenPages, resetTimer]);

  // 🔥 Render condicional correto (dentro do JSX, não durante render)
  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {showAvatar && !openChat && (
        <div
          onClick={() => setOpenChat(true)}
          style={{
            position: "fixed",
            bottom: 110,
            right: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 50,
            boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
            cursor: "pointer",
            zIndex: 9999,
            maxWidth: 280,
          }}
        >
          <img
            src={AVATAR_URL}
            alt="Dayane"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff",
              flexShrink: 0,
            }}
          />

          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              Olá, eu sou Dayane
            </div>
            <div style={{ fontSize: 13 }}>
              Em que posso te ajudar?
            </div>
          </div>
        </div>
      )}

      {openChat && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 18,
            width: 360,
            maxWidth: "92vw",
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              background: "#4f46e5",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Fale com {ASSISTANT_NAME}
            <span
              style={{ cursor: "pointer", fontSize: 16 }}
              onClick={() => {
                setOpenChat(false);
                setShowAvatar(false);
                resetTimer();
              }}
            >
              ✕
            </span>
          </div>

          <div style={{ padding: 12 }}>
            <ChatBot />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatBot;