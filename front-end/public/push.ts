// frontend/src/services/push.ts
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../lib/firebase";
import axios from "axios";

const messaging = getMessaging(firebaseApp);

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://zlpix-premiado-fullstack.onrender.com";

/**
 * =====================================================
 * REGISTRA PUSH PARA USUÁRIO LOGADO
 * =====================================================
 */
export async function registerPush(userId: number) {
  try {
    if (!("Notification" in window)) {
      console.warn("🔕 Navegador não suporta notificações");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🔕 Permissão de notificação negada");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn("⚠️ Token FCM não gerado");
      return;
    }

    // ✅ ENDPOINT CORRETO
    await axios.post(`${BASE_URL}/push/register`, {
      token,
      userId,
    });

    console.log("📲 Push registrado com sucesso", token);
  } catch (err) {
    console.error("❌ Erro ao registrar push:", err);
  }
}

/**
 * =====================================================
 * ESCUTA PUSH EM FOREGROUND
 * =====================================================
 */
export function listenForegroundPush() {
  onMessage(messaging, (payload) => {
    console.log("📩 Push em foreground:", payload);

    const title =
      payload.notification?.title || "ZLPix Premiado";

    const body =
      payload.notification?.body || "Você recebeu uma notificação";

    new Notification(title, { body });
  });
}