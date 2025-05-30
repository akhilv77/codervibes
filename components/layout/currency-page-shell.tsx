"use client";

import { NavTabs } from "@/components/layout/nav-tabs";
import { BackButton } from "../ui/back-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface CurrencyPageShellProps {
    children: React.ReactNode;
}

export function CurrencyPageShell({ children }: CurrencyPageShellProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto max-w-screen-xl px-4">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BackButton path="/" />
                            <div className="flex items-center gap-2 font-semibold">
                                <span className="text-primary text-xl sm:text-2xl md:text-3xl font-bold">Currency Tracker</span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                    <p className="text-sm sm:text-base font-medium md:ml-14 mb-4 md:mb-5 text-muted-foreground">
                        Track and convert currencies with daily updates
                    </p>
                </div>
            </header>
            <main className="flex-1 flex justify-center">
                <div className="container max-w-screen-xl px-4 py-4">{children}</div>
            </main>
            <footer className="border-t py-4">
                <div className="container max-w-screen-xl px-4 flex justify-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Currency Tracker App</p>
                </div>
            </footer>
        </div>
    );
} 