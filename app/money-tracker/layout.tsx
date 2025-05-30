'use client';

import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutGrid, Users } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
    {
        name: "Dashboard",
        href: "/money-tracker",
        exact: true,
        icon: <LayoutGrid className="h-4 w-4" />
    },
    {
        name: "Members",
        href: "/money-tracker/members",
        exact: true,
        icon: <Users className="h-4 w-4" />
    },
];

function NavTabs() {
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

export default function MoneyTrackerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 w-full border-b bg-background">
                <div className="mx-auto max-w-screen-xl px-4">
                    <div className="flex h-14 items-center justify-between mt-10">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex items-center gap-2 font-semibold">
                                <span className="text-primary text-2xl font-bold">Money Tracker</span>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
                <NavTabs />
            </header>
            <main className="flex-1 flex justify-center bg-background">
                <div className="container max-w-screen-xl px-4 py-4">{children}</div>
            </main>
            <footer className="border-t py-4 bg-background">
                <div className="container max-w-screen-xl px-4 flex justify-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} Money Tracker</p>
                </div>
            </footer>
        </div>
    );
} 