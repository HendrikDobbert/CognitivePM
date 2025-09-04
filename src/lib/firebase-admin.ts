
import "server-only";
import { initializeApp, getApps, App, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// Helper function to initialize Firebase Admin App
export function getFirebaseAdminApp(): App {
  // If we're in a production-like environment with the service account, use it.
  if (serviceAccount) {
    if (getApps().some(app => app.name === 'admin')) {
      return getApp('admin');
    }
    return initializeApp({
      credential: cert(serviceAccount)
    }, 'admin');
  }

  // Otherwise, use the default app initialization for local development.
  if (getApps().length > 0) {
    return getApp();
  }

  // This simplified initialization is suitable for local development environments
  // where the server might not have service account credentials configured.
  // The client-side firebase config will be implicitly used.
  return initializeApp();
}

export const adminAuth = getAuth(getFirebaseAdminApp());
