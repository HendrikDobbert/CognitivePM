import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";

import { SidebarNav } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

async function checkAuth() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    return false;
  }
  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
    return true;
  } catch (error) {
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
