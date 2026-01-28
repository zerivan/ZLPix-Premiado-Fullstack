// front-end/src/components/GlobalChatBot.tsx

import React, { useEffect, useRef, useState } from "react";
import ChatBot from "./ChatBot";

const INACTIVITY_TIME = 30000; // 30 segundos

const GlobalChatBot: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  // 🔧 CORREÇÃO: usar number (ambiente browser)
  const timerRef = useRef<number | null>(null);

  const resetTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      if (!openChat) {
        setShowPrompt(true);
      }
    }, INACTIVITY_TIME);
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];

    const handleActivity = () => {
      setShowPrompt(false);
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
      {/* Balão de sugestão */}
      {showPrompt && !openChat && (
        <div
          onClick={() => {
            setOpenChat(true);
            setShowPrompt(false);
          }}
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            background: "#007bff",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 20,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          Está com dúvida? Posso ajudar.
        </div>
      )}

      {/* Botão fixo */}
      {!openChat && (
        <div
          onClick={() => setOpenChat(true)}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#007bff",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 9999,
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
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              borderBottom: "1px solid #eee",
              fontWeight: "bold",
            }}
          >
            Assistente
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setOpenChat(false)}
            >
              ✕
            </span>
          </div>

          <div style={{ padding: 10 }}>
            <ChatBot />
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalChatBot;