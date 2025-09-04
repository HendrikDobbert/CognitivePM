"use client";

import Link from "next/link";
import { BrainCircuit } from "lucide-react";

import { NavLinks } from "./nav-links";

export function SidebarNav() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg">CognitivePM</span>
        </Link>
      </div>
      <NavLinks />
    </aside>
  );
}
