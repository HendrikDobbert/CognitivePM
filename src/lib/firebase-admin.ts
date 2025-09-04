import "server-only";
import { initializeApp, getApps, App, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

// Helper function to initialize Firebase Admin App
export function getFirebaseAdminApp(): App {
    if (getApps().length) {
        return getApp();
    }
    
    if (!serviceAccount) {
        throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
    }
    
    return initializeApp({
        credential: cert(serviceAccount),
    });
}

export const adminAuth = getAuth(getFirebaseAdminApp());
