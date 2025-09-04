"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

async function createSession(idToken: string) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Failed to create session: ${errorBody}`);
  }
  return res.json();
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const idToken = await user.getIdToken(true);
          await createSession(idToken);
          setUser(user);
          // Explicitly redirect after session is created
          router.push("/dashboard"); 
        } catch (e) {
          console.error("useAuth: Error during session creation or getting idToken:", e);
          // If session creation fails, sign the user out on the client to avoid an inconsistent state
          await auth.signOut(); 
          setUser(null);
        }
      } else {
        await deleteSession();
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    }
  }, [router]); // Add router to dependency array

  return { user, loading };
}
