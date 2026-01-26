/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

/**
============================
FIREBASE CONFIG — SERVICE WORKER
(MESMO PROJETO DO FRONT)
============================
*/
firebase.initializeApp({
  apiKey: "AIzaSyBTJanXweYDNFHvYvW7EP6fUbyUMcDz3Ig",
  authDomain: "zlpix-premiado.firebaseapp.com",
  projectId: "zlpix-premiado",
  storageBucket: "zlpix-premiado.firebasestorage.app",
  messagingSenderId: "530368618940",
  appId: "1:530368618940:web:bfbb8dd5d343eb1526cbb9",
});

/**
============================
FIREBASE MESSAGING
============================
*/
const messaging = firebase.messaging();

/**
============================
PUSH EM BACKGROUND
============================
*/
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Push recebido:", payload);

  const notificationTitle =
    payload.notification?.title || "ZLPix Premiado";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "Você tem uma nova notificação 🎉",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: {
      // 🔥 Mantém somente o path recebido
      url: payload.data?.url || "/meus-bilhetes",
    },
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

/**
============================
CLIQUE NA NOTIFICAÇÃO
============================
*/
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // 🔥 Garante URL ABSOLUTA correta
  const relativePath =
    event.notification?.data?.url || "/meus-bilhetes";

  const absoluteUrl = new URL(
    relativePath,
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // 🔥 Só reutiliza se for exatamente a mesma URL
        for (const client of clientList) {
          if (client.url === absoluteUrl && "focus" in client) {
            return client.focus();
          }
        }

        // 🔥 Caso contrário abre a rota correta
        if (clients.openWindow) {
          return clients.openWindow(absoluteUrl);
        }
      })
  );
});