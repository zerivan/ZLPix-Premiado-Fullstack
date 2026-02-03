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
    {/* Avatar SVG morena com cabelo cacheado */}
    <svg
      width="56"
      height="56"
      viewBox="0 0 64 64"
      style={{ flexShrink: 0 }}
    >
      {/* Cabelo cacheado */}
      <path
        d="M12 28c0-10 8-18 20-18s20 8 20 18c0 0-4-6-8-6-2-6-8-8-12-8s-10 2-12 8c-4 0-8 6-8 6z"
        fill="#2d1b14"
      />
      {/* Rosto */}
      <circle cx="32" cy="36" r="14" fill="#c68642" />
      {/* Olhos */}
      <circle cx="27" cy="34" r="1.5" fill="#000" />
      <circle cx="37" cy="34" r="1.5" fill="#000" />
      {/* Sorriso */}
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