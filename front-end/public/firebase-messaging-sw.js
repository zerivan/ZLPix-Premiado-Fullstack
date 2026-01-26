/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

/**
 * ============================
 * FIREBASE CONFIG — SERVICE WORKER
 * ============================
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
 * ============================
 * FIREBASE MESSAGING
 * ============================
 */
const messaging = firebase.messaging();

/**
 * ============================
 * PUSH EM BACKGROUND
 * ============================
 */
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Push recebido:",
    payload
  );

  const notificationTitle =
    payload.notification?.title || "ZLPix Premiado";

  const notificationOptions = {
    body:
      payload.notification?.body ||
      "Você tem uma nova notificação 🎉",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
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
 * ============================
 * CLIQUE NA NOTIFICAÇÃO
 * ============================
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const relativeUrl =
    event.notification?.data?.url || "/meus-bilhetes";

  // 🔥 FORÇA URL ABSOLUTA (CORREÇÃO)
  const absoluteUrl = new URL(
    relativeUrl,
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === absoluteUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(absoluteUrl);
        }
      })
  );
});