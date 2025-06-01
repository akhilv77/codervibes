'use client';

import { ReactNode } from 'react';

interface RegexTesterPageShellProps {
    children: ReactNode;
}

export function RegexTesterPageShell({ children }: RegexTesterPageShellProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
} 