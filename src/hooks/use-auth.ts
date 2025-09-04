"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

async function createSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    throw new Error("Failed to create session");
  }
}

async function deleteSession() {
  const res = await fetch("/api/auth/session", { method: "DELETE" });
  if (!res.ok) {
    throw new Error("Failed to delete session");
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken(true); // Force refresh
          await createSession(idToken);
          setUser(user);
        } catch (e) {
          console.error("Failed to create session cookie:", e);
          setUser(null);
        }
      } else {
        await deleteSession();
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
