"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Settings, Users, Play, LayoutGrid
} from "lucide-react";

const navItems = [
  {
    name: "Games",
    href: "/scorecard",
    exact: true,
    icon: <LayoutGrid className="h-4 w-4" />
  },
  {
    name: "Players",
    href: "/scorecard/players",
    exact: true,
    icon: <Users className="h-4 w-4" />
  },
  {
    name: "Play",
    href: "/scorecard/play",
    exact: true,
    icon: <Play className="h-4 w-4" />
  },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <div className="mx-auto max-w-screen-xl px-4">
        <nav className="flex" aria-label="Tabs">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "h-auto px-3 py-4",
                  "group inline-flex items-center text-sm font-medium border-b-2 -mb-px",
                  isActive
                    ? "text-primary border-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}