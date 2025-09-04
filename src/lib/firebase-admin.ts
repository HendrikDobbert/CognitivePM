
import { initializeApp, getApps, App, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// This is a singleton pattern to ensure we only initialize the app once.
let app: App;

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production environment
    app = initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } else {
    // Development environment
    app = initializeApp({
      projectId: 'cognitivepm', // Replace with your actual project ID
    });
  }
} else {
  app = getApp();
}

export const adminAuth = getAuth(app);
