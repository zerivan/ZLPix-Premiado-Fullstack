import * as admin from "firebase-admin";

/**
 * ============================
 * FIREBASE ADMIN — INICIALIZAÇÃO CENTRALIZADA
 * ============================
 */

let firebaseInitialized = false;

export function initializeFirebase() {
  if (firebaseInitialized) {
    console.log("🔥 Firebase Admin já inicializado");
    return;
  }

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.error("❌ Variáveis Firebase não configuradas:");
      console.error("  - FIREBASE_PROJECT_ID:", projectId ? "✓" : "✗");
      console.error("  - FIREBASE_CLIENT_EMAIL:", clientEmail ? "✓" : "✗");
      console.error("  - FIREBASE_PRIVATE_KEY:", privateKey ? "✓" : "✗");
      console.warn("⚠️ Push notifications NÃO funcionarão sem as credenciais do Firebase");
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

      firebaseInitialized = true;
      console.log("✅ Firebase Admin inicializado com sucesso");
      console.log(`   Project ID: ${projectId}`);
    } catch (error) {
      console.error("❌ Erro ao inicializar Firebase Admin:", error);
      throw error;
    }
  } else {
    firebaseInitialized = true;
    console.log("✅ Firebase Admin já estava inicializado");
  }
}

export function getMessaging() {
  if (!admin.apps.length) {
    console.error("❌ Firebase Admin não inicializado! Chamando initializeFirebase()...");
    initializeFirebase();
  }

  return admin.messaging();
}

// Auto-inicialização
initializeFirebase();