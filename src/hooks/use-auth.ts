"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function createSession(idToken: string) {
  console.log("useAuth createSession: Attempting to create session...");
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  
  console.log("useAuth createSession: fetch response status:", res.status);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("useAuth createSession: Failed to create session. Status:", res.status, "Body:", errorBody);
    throw new Error(`Failed to create session: ${errorBody}`);
  }
  const responseJson = await res.json();
  console.log("useAuth createSession: Session created successfully. Response:", responseJson);
}

async function deleteSession() {
  console.log("useAuth deleteSession: Deleting session...");
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
      if (user) {
        console.log("useAuth onAuthStateChanged: User is present. Attempting to get ID token.");
        try {
          const idToken = await user.getIdToken(true); // Force refresh
          console.log("useAuth onAuthStateChanged: Got idToken, length:", idToken.length);
          await createSession(idToken);
          setUser(user);
        } catch (e) {
          console.error("useAuth onAuthStateChanged: Error during session creation or getting idToken:", e);
          setUser(null);
        }
      } else {
        console.log("useAuth onAuthStateChanged: User is null. Deleting session.");
        await deleteSession();
        setUser(null);
      }
      setLoading(false);
      console.log("useAuth onAuthStateChanged: Auth state processing finished. Loading set to false.");
    });

    return () => {
        console.log("useAuth Effect: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
    }
  }, []);

  return { user, loading };
}
