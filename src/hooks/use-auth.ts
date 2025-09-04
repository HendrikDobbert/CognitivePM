"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function createSession(idToken: string) {
  console.log("useAuth createSession: Calling /api/auth/session to create cookie.");
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  
  console.log("useAuth createSession: fetch response status:", res.status);
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("useAuth createSession: Failed to create session.", { status: res.status, body: errorBody });
    throw new Error(`Failed to create session: ${errorBody}`);
  }
  console.log("useAuth createSession: Session created successfully.");
  return res.json();
}

async function deleteSession() {
  console.log("useAuth deleteSession: Calling /api/auth/session to delete cookie.");
  const res = await fetch("/api/auth/session", { method: "DELETE" });
  console.log("useAuth deleteSession: fetch response status:", res.status);
  if (!res.ok) {
    console.error("useAuth deleteSession: Failed to delete session.");
    throw new Error("Failed to delete session");
  }
  console.log("useAuth deleteSession: Session deleted successfully.");
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useAuth Effect: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("useAuth onAuthStateChanged: Auth state changed. User object:", user ? user.uid : null);
      setLoading(true);
      if (user) {
        try {
          console.log("useAuth onAuthStateChanged: User is present. Getting ID token...");
          const idToken = await user.getIdToken(true);
          console.log("useAuth onAuthStateChanged: Got ID token. Calling createSession.");
          await createSession(idToken);
          console.log("useAuth onAuthStateChanged: Session creation process complete. Setting user.");
          setUser(user);
        } catch (e) {
          console.error("useAuth: Error during session creation or getting idToken:", e);
          // If session creation fails, sign the user out on the client to avoid an inconsistent state
          await auth.signOut(); 
          setUser(null);
        }
      } else {
        console.log("useAuth onAuthStateChanged: User is null. Deleting session.");
        await deleteSession();
        setUser(null);
      }
      console.log("useAuth onAuthStateChanged: Auth state processing finished. Loading set to false.");
      setLoading(false);
    });

    return () => {
      console.log("useAuth Effect: Cleaning up onAuthStateChanged listener.");
      unsubscribe();
    }
  }, []);

  return { user, loading };
}
