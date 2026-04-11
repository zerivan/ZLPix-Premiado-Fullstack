import * as admin from "firebase-admin";

/**
 * ============================
 * FIREBASE ADMIN — INICIALIZAÇÃO CENTRALIZADA
 * ============================
 */

export function initializeFirebase() {
  if (admin.apps.length) {
    console.log("🔥 Firebase Admin já inicializado");
    return true;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Variáveis Firebase não configuradas:");
    console.error("  - FIREBASE_PROJECT_ID:", projectId ? "✓" : "✗");
    console.error("  - FIREBASE_CLIENT_EMAIL:", clientEmail ? "✓" : "✗");
    console.error("  - FIREBASE_PRIVATE_KEY:", privateKey ? "✓" : "✗");
    console.warn("⚠️ Firebase Admin não inicializado por falta de credenciais.");
    return false;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log("✅ Firebase Admin inicializado com sucesso");
    console.log(`   Project ID: ${projectId}`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin:", error);
    return false;
  }
}

export function getMessaging() {
  if (!admin.apps.length) {
    console.warn("⚠️ Firebase Admin não inicializado. Inicializando sob demanda...");
    const initialized = initializeFirebase();
    if (!initialized) {
      throw new Error("Firebase Admin indisponível: verifique credenciais e inicialização.");
    }
  }

  return admin.messaging();
}

// Auto-inicialização
initializeFirebase();