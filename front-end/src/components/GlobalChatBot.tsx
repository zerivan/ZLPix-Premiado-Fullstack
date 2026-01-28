import React, { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000;

const ASSISTANT_NAME = "Dayane";
const ASSISTANT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/4712109.png";

const GlobalChatBot: React.FC = () => {
  const [showAvatar, setShowAvatar] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
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
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    const handleActivity = () => {
      if (!openChat) {
        setShowAvatar(false);
        startTimer();
      }
    };

    events.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    startTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );

      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [openChat]);

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>

      {/* Avatar + mensagem */}
      {showAvatar && !openChat && (
        <div
          onClick={() => setOpenChat(true)}
          style={{
            position: "fixed",
            bottom: 120,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: 50,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            cursor: "pointer",
            animation: "slideInRight 0.4s ease-out",
            zIndex: 9999,
            maxWidth: 280,
          }}
        >
          <img
            src={ASSISTANT_AVATAR}
            alt={ASSISTANT_NAME}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            <strong>{ASSISTANT_NAME}</strong>
            <div>Olá, posso te ajudar de alguma forma?</div>
          </div>
        </div>
      )}

      {/* Janela do chat */}
      {openChat && (
        <div
          style={{
            position: "fixed",
            bottom: 120,
            right: 20,
            width: 380,
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
              background: "#007bff",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: 600,
            }}
          >
            Fale com {ASSISTANT_NAME}
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                setOpenChat(false);
                setShowAvatar(false);
                startTimer();
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