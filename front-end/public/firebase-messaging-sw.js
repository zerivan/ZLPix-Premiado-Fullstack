/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

/**
 * FIREBASE CONFIG
 * (copiar os mesmos dados do vite.config.ts)
 */
firebase.initializeApp({
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID",
});

const messaging = firebase.messaging();

/**
 * Recebe push em background
 */
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "ZLPix Premiado";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icon-192.png", // se existir
    data: {
      url: payload.data?.url || "/meus-bilhetes",
    },
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

/**
 * Clique na notificação
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification?.data?.url || "/meus-bilhetes";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    )
  );
});