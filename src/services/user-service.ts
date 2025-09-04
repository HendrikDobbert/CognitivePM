import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "firebase/auth";

/**
 * Creates or updates a user document in Firestore.
 * This function is idempotent: if the user already exists, it does nothing.
 * If the user doesn't exist, it creates a new document.
 * @param user The Firebase Auth User object.
 */
export async function createOrUpdateUser(user: User) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { uid, email, displayName, photoURL } = user;
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      photoURL,
      createdAt: serverTimestamp(),
    });
  }
}
