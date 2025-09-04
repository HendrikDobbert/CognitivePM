import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1bN7mMHbHomstyS2f6pfttGVZZVhXSdU",
  authDomain: "cognitivepm.firebaseapp.com",
  projectId: "cognitivepm",
  storageBucket: "cognitivepm.firebasestorage.app",
  messagingSenderId: "791515009157",
  appId: "1:791515009157:web:db5becc106885aa16d59ec"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
