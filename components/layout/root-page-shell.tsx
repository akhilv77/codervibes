import { NavTabs } from "@/components/layout/nav-tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageShellProps {
  children: React.ReactNode;
}

export function RootPageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 flex justify-center">
        <div className="container max-w-screen-xl px-4 py-4">{children}</div>
      </main>
      <footer className="border-t py-4">
        <div className="container max-w-screen-xl px-4 flex justify-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} App Suite</p>
        </div>
      </footer>
    </div>
  );
}