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
            zIndex: 9999,
            maxWidth: 280,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#4f46e5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            D
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            <strong>{ASSISTANT_NAME}</strong>
            <div>Olá, posso te ajudar de alguma forma?</div>
          </div>
        </div>
      )}

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