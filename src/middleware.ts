import { NextResponse, type NextRequest } from "next/server";
import { getFirebaseAdminApp } from "./lib/firebase-admin";
import { auth } from "firebase-admin";

export const runtime = 'nodejs';

async function verifySessionCookie(sessionCookie: string) {
  const adminApp = getFirebaseAdminApp();
  try {
    const decodedClaims = await auth(adminApp).verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // If no session cookie, redirect to login for protected routes
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Verify the session cookie.
  const decodedToken = await verifySessionCookie(session);

  if (!decodedToken) {
     if (request.nextUrl.pathname.startsWith('/dashboard')) {
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // If session is valid and user is on login page, redirect to dashboard
  if (decodedToken && request.nextUrl.pathname === '/') {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
