import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "cognitivepm",
  "appId": "1:791515009157:web:db5becc106885aa16d59ec",
  "storageBucket": "cognitivepm.firebasestorage.app",
  "apiKey": "AIzaSyB1bN7mMHbHomstyS2f6pfttGVZZVhXSdU",
  "authDomain": "cognitivepm.firebaseapp.com",
  "messagingSenderId": "791515009157"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
