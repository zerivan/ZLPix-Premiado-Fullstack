// front-end/src/components/GlobalChatBot.tsx

import React, { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000;

const ASSISTANT_NAME = "Dayane";
const ASSISTANT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";

const PROMPT_MESSAGE =
  "Olá 👋 Eu sou a Dayane, assistente do ZLpix. Posso te ajudar em algo?";

const GlobalChatBot: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const timerRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      if (!openChat) {
        setShowTyping(true);

        // Simula "digitando..." por 1.5s
        setTimeout(() => {
          setShowTyping(false);
          setShowPrompt(true);

          // Vibração leve no mobile
          if (navigator.vibrate) {
            navigator.vibrate(120);
          }
        }, 1500);
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    const handleActivity = () => {
      setShowPrompt(false);
      setShowTyping(false);
      resetTimer();
    };

    events.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    resetTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [openChat]);

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.08); }
            100% { transform: scale(1); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes dots {
            0% { content: "."; }
            33% { content: ".."; }
            66% { content: "..."; }
          }
        `}
      </style>

      {/* Indicador digitando */}
      {showTyping && !openChat && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: 20,
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            zIndex: 9999,
            animation: "fadeIn 0.3s ease-out",
            fontSize: 14,
          }}
        >
          <strong>{ASSISTANT_NAME}</strong> está digitando...
        </div>
      )}

      {/* Balão com mensagem */}
      {showPrompt && !openChat && (
        <div
          onClick={() => {
            setOpenChat(true);
            setShowPrompt(false);
          }}
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#ffffff",
            padding: "12px 16px",
            borderRadius: 20,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
            zIndex: 9999,
            maxWidth: 280,
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          <img
            src={ASSISTANT_AVATAR}
            alt="avatar"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
            }}
          />
          <div style={{ fontSize: 14, lineHeight: 1.4 }}>
            <strong>{ASSISTANT_NAME}</strong>
            <div>{PROMPT_MESSAGE}</div>
          </div>
        </div>
      )}

      {/* Botão pulsando */}
      {!openChat && (
        <div
          onClick={() => setOpenChat(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 65,
            height: 65,
            borderRadius: "50%",
            background: "#007bff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
            zIndex: 9999,
            animation: showPrompt ? "pulse 1.5s infinite" : "none",
            transition: "all 0.3s ease",
          }}
        >
          Chat
        </div>
      )}

      {/* Janela do chat */}
      {openChat && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 380,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 14px",
              background: "#007bff",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Fale com {ASSISTANT_NAME}
            <span
              style={{ cursor: "pointer", fontWeight: 400 }}
              onClick={() => setOpenChat(false)}
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