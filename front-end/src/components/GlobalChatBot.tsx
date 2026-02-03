import React, { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000;
const ASSISTANT_NAME = "Olá, eu sou Dayane";

const GlobalChatBot: React.FC = () => {
  const [showAvatar, setShowAvatar] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      if (!openChat) {
        setShowAvatar(true);
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
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
  }, [openChat]);

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
            padding: "10px 16px",
            borderRadius: 50,
            boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
            cursor: "pointer",
            zIndex: 9999,
            maxWidth: 260,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Avatar feminino cabelo cacheado */}
            <svg
              width="38"
              height="38"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="32" cy="32" r="30" fill="#f3f4f6" />
              <circle cx="32" cy="28" r="12" fill="#fcd7b6" />
              <path
                d="M16 28c0-10 8-18 16-18s16 8 16 18c0 0-3-6-6-6s-3 4-6 4-3-4-6-4-6 6-6 6z"
                fill="#2f2f2f"
              />
              <circle cx="27" cy="27" r="2" fill="#333" />
              <circle cx="37" cy="27" r="2" fill="#333" />
              <path
                d="M27 33c2 2 8 2 10 0"
                stroke="#b45309"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>
              {ASSISTANT_NAME}
            </div>
            <div style={{ fontSize: 13 }}>
              Posso te ajudar?
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