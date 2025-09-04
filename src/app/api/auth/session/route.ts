// src/app/api/auth/session/route.ts
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("API /api/auth/session POST: Received request.");
  const body = await request.json();
  const { idToken } = body;


  if (!idToken) {
    console.error("API /api/auth/session POST: idToken is missing from request body.", body);
    return NextResponse.json(
      { error: "idToken is required" },
      { status: 400 }
    );
  }

  // Set session expiration to 5 days.
  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  console.log("API /api/auth/session POST: idToken received, length:", idToken.length);


  try {
    console.log("API /api/auth/session POST: Creating session cookie...");
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    console.log("API /api/auth/session POST: Session cookie created and set successfully.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/auth/session POST: Error creating session cookie:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  console.log("API /api/auth/session DELETE: Received request to delete cookie.");
  try {
    cookies().delete("session");
    console.log("API /api/auth/session DELETE: Session cookie deleted successfully.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /api/auth/session DELETE: Error deleting cookie:", error);
    return NextResponse.json({ success: false, error: "Failed to delete session" }, { status: 500 });
  }
}
