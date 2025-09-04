import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";

import { SidebarNav } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

async function checkAuth() {
  console.log("DashboardLayout: Checking auth...");
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    console.log("DashboardLayout: No session cookie found.");
    return false;
  }
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log("DashboardLayout: Session cookie verified successfully.");
    return true;
  } catch (error) {
    console.error("DashboardLayout: Session cookie verification failed:", error);
    return false;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isLoggedIn = await checkAuth();

  if (!isLoggedIn) {
    console.log("DashboardLayout: User not logged in, redirecting to /");
    redirect("/");
  }

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
