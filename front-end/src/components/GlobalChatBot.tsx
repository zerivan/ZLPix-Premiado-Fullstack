import React, { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000;

const ASSISTANT_NAME = "Dayane";

const GlobalChatBot: React.FC = () => {
  const [showAvatar, setShowAvatar] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setShowAvatar(true);
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
            bottom: 100,
            right: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffffff",
            padding: "10px 14px",
            borderRadius: 40,
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            cursor: "pointer",
            zIndex: 9999,
            maxWidth: "85vw",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            D
          </div>

          <div style={{ fontSize: 13, lineHeight: 1.3 }}>
            <strong>{ASSISTANT_NAME}</strong>
            <div>Olá, posso te ajudar?</div>
          </div>
        </div>
      )}

      {openChat && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 16,
            width: 360,
            maxWidth: "95vw",
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
            }}
          >
            Fale com {ASSISTANT_NAME}
            <span
              style={{ cursor: "pointer" }}
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