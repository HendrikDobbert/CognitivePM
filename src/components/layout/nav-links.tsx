"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, FolderKanban } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Button
              asChild
              variant={pathname.startsWith(link.href) && (link.href.length > 10 || pathname.length === link.href.length)? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <Link href={link.href}>
                <link.icon className="mr-3 h-5 w-5" />
                {link.name}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
