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
            gap: 14,
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
          <svg
            width="56"
            height="56"
            viewBox="0 0 64 64"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M12 28c0-10 8-18 20-18s20 8 20 18c0 0-4-6-8-6-2-6-8-8-12-8s-10 2-12 8c-4 0-8 6-8 6z"
              fill="#2d1b14"
            />
            <circle cx="32" cy="36" r="14" fill="#c68642" />
            <circle cx="27" cy="34" r="1.5" fill="#000" />
            <circle cx="37" cy="34" r="1.5" fill="#000" />
            <path
              d="M27 40c2 2 8 2 10 0"
              stroke="#000"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              Olá, eu sou {ASSISTANT_NAME}
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