import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Olá, eu sou a Dayane. Estou aqui para te orientar sobre o funcionamento do ZLpix Premiado. Como posso ajudar?",
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/assistant/chat", {
        message: userMessage.content,
      });

      const botMessage: Message = {
        role: "assistant",
        content:
          response.data?.reply ||
          "Não foi possível processar sua solicitação.",
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Não foi possível comunicar com o servidor no momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          height: 260,
          overflowY: "auto",
          marginBottom: 10,
          background: "#fafafa",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === "user" ? "right" : "left",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background:
                  msg.role === "user" ? "#4f46e5" : "#e5e5ea",
                color: msg.role === "user" ? "#fff" : "#000",
                maxWidth: "85%",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ fontSize: 13, color: "#666" }}>
            Dayane está digitando...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0 16px",
            borderRadius: 6,
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}