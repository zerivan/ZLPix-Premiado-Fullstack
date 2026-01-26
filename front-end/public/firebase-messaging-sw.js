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

  const url = event.notification?.data?.url || "/meus-bilhetes";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }