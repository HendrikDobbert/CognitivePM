import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";

import { SidebarNav } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

async function checkAuth() {
  console.log("DashboardLayout checkAuth: Verifying session cookie...");
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    console.log("DashboardLayout checkAuth: No session cookie found.");
    return null;
  }
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log("DashboardLayout checkAuth: Session cookie verified successfully for UID:", decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error("DashboardLayout checkAuth: Session cookie verification failed:", error);
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("DashboardLayout: Rendering. Checking auth status...");
  const decodedToken = await checkAuth();

  if (!decodedToken) {
    console.log("DashboardLayout: User not authenticated, redirecting to /");
    redirect("/");
  }

  console.log("DashboardLayout: User is authenticated. Rendering dashboard.");
  return (
    <div className="flex min-h-screen w-full">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
