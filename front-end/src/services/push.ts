import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../lib/firebase";
import { api } from "../api/client";

const messaging = getMessaging(firebaseApp);

/**
 * =====================================================
 * REGISTRA PUSH PARA USUÁRIO LOGADO
 * =====================================================
 */
export async function registerPush(userId: number) {
  try {
    const normalizedUserId = Number(userId);
    if (!normalizedUserId || Number.isNaN(normalizedUserId)) {
      console.warn("⚠️ userId inválido para registrar push", userId);
      return;
    }

    if (!("Notification" in window)) {
      console.warn("🔕 Navegador não suporta notificações");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🔕 Permissão de notificação negada");
      return;
    }

    const existingRegistration = await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js"
    );

    const registration =
      existingRegistration ||
      (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));

    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("⚠️ Token FCM não gerado");
      return;
    }

    console.log("📲 Registrando push token", {
      userId: normalizedUserId,
    });

    await api.post("/push/token", {
      token,
      userId: normalizedUserId,
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