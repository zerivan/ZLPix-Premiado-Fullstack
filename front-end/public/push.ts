// frontend/src/services/push.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyBTJanXweYDNFHvYvW7EP6fUbyUMcDz3Ig",
  authDomain: "zlpix-premiado.firebaseapp.com",
  projectId: "zlpix-premiado",
  storageBucket: "zlpix-premiado.firebasestorage.app",
  messagingSenderId: "530368618940",
  appId: "1:530368618940:web:bfbb8dd5d343eb1526cbb9",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://zlpix-premiado-fullstack.onrender.com";

export async function registerPush(userId: number) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🔕 Permissão de notificação negada");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) {
      console.warn("❌ Token de push não gerado");
      return;
    }

    await axios.post(`${BASE_URL}/push/token`, {
      token,
      userId,
    });

    console.log("✅ Push registrado com sucesso", token);
  } catch (err) {
    console.error("❌ Erro ao registrar push", err);
  }
}