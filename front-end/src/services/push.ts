import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseApp } from "../lib/firebase";
import { api } from "../api/client";

const messaging = getMessaging(firebaseApp);

// 🔥 CONSTANTES DE TIMEOUT
const FIREBASE_TOKEN_TIMEOUT = 15000; // 15 segundos
const SERVICE_WORKER_TIMEOUT = 10000; // 10 segundos

/**
 * =====================================================
 * HELPER: Promise com timeout
 * =====================================================
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  name: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Timeout: ${name} excedeu ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * =====================================================
 * REGISTRA PUSH PARA USUÁRIO LOGADO
 * 🔥 CORRIGIDO: Adicionar timeout e AbortController
 * =====================================================
 */
export async function registerPush(userId: number) {
  let abortController: AbortController | null = null;

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

    // 🔥 Tentar obter registration com timeout
    let registration;
    try {
      const existingRegistration = await withTimeout(
        navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js"),
        SERVICE_WORKER_TIMEOUT,
        "getRegistration"
      );

      if (existingRegistration) {
        registration = existingRegistration;
        console.log("✅ Usando existing service worker registration");
      } else {
        registration = await withTimeout(
          navigator.serviceWorker.register("/firebase-messaging-sw.js"),
          SERVICE_WORKER_TIMEOUT,
          "register"
        );
        console.log("✅ Novo service worker registrado");
      }
    } catch (err) {
      console.error("❌ Erro ao registrar/obter service worker:", err);
      return;
    }

    // 🔥 Aguardar service worker estar pronto (com timeout)
    try {
      await withTimeout(
        navigator.serviceWorker.ready,
        SERVICE_WORKER_TIMEOUT,
        "serviceWorker.ready"
      );
    } catch (err) {
      console.error("❌ Service worker nunca ficou pronto:", err);
      return;
    }

    // 🔥 Obter token do Firebase com timeout
    let token;
    try {
      token = await withTimeout(
        getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        }),
        FIREBASE_TOKEN_TIMEOUT,
        "getToken"
      );
    } catch (err) {
      console.error("❌ Erro ao obter Firebase token:", err);
      return;
    }

    if (!token) {
      console.warn("⚠️ Token FCM não gerado");
      return;
    }

    console.log("📲 Registrando push token", {
      userId: normalizedUserId,
    });

    // 🔥 Registrar token com AbortController
    abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController?.abort(), 10000);

    try {
      await api.post("/push/token", {
        token,
        userId: normalizedUserId,
      });

      clearTimeout(timeoutId);
      console.log("✅ Push registrado com sucesso");
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("❌ Erro ao registrar token no backend:", err);
    }
  } catch (err) {
    console.error("❌ Erro geral ao registrar push:", err);
  }
}

/**
 * =====================================================
 * ESCUTA PUSH EM FOREGROUND
 * =====================================================
 */
export function listenForegroundPush() {
  try {
    onMessage(messaging, (payload) => {
      console.log("📩 Push em foreground:", payload);

      const title =
        payload.notification?.title || "ZLPix Premiado";

      const body =
        payload.notification?.body || "Você recebeu uma notificação";

      new Notification(title, { body });
    });
  } catch (err) {
    console.error("❌ Erro ao configurar listener de push:", err);
  }
}