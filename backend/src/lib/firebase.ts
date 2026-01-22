import * as admin from "firebase-admin";

/**
 * ============================
 * FIREBASE ADMIN — INICIALIZAÇÃO CENTRALIZADA
 * ============================
 * Centraliza a inicialização do Firebase Admin SDK
 * para evitar duplicação e facilitar manutenção
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
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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

/**
 * Retorna a instância do Firebase Admin Messaging
 * Verifica se está inicializado antes de retornar
 */
export function getMessaging() {
  if (!admin.apps.length) {
    console.error("❌ Firebase Admin não inicializado! Chamando initializeFirebase()...");
    initializeFirebase();
  }
  
  if (!admin.apps.length) {
    throw new Error("Firebase Admin não pôde ser inicializado. Verifique as variáveis de ambiente.");
  }
  
  return admin.messaging();
}

// Auto-inicialização ao importar
initializeFirebase();
