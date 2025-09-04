
import { initializeApp, getApps, App, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// This is a singleton pattern to ensure we only initialize the app once.
let app: App;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production environment
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Development environment
    // This is for local development and assumes you're using the Firebase Emulator Suite
    // or have authenticated via gcloud CLI.
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cognitivepm',
    });
  }
} else {
  app = getApp();
}

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
