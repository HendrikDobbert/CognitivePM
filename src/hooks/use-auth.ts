"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function createSession(idToken: string) {
  console.log("useAuth: Attempting to create session...");
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("useAuth: Failed to create session. Status:", res.status, "Body:", errorBody);
    throw new Error("Failed to create session");
  }
  console.log("useAuth: Session created successfully.");
}

async function deleteSession() {
  console.log("useAuth: Deleting session...");
  const res = await fetch("/api/auth/session", { method: "DELETE" });
  if (!res.ok) {
    console.error("useAuth: Failed to delete session.");
    throw new Error("Failed to delete session");
  }
  console.log("useAuth: Session deleted successfully.");
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useAuth: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("useAuth: onAuthStateChanged triggered. User:", user ? user.uid : null);
      if (user) {
        try {
          const idToken = await user.getIdToken(true); // Force refresh
          console.log("useAuth: Got idToken. Length:", idToken.length);
          await createSession(idToken);
          setUser(user);
        } catch (e) {
          console.error("useAuth: Error during session creation or getting idToken:", e);
          setUser(null);
        }
      } else {
        await deleteSession();
        setUser(null);
      }
      setLoading(false);
      console.log("useAuth: Auth state processing finished. Loading set to false.");
    });

    return () => {
        console.log("useAuth: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
    }
  }, []);

  return { user, loading };
}
