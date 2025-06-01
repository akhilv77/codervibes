'use client';

import { ReactNode } from 'react';

interface IPTrackerPageShellProps {
    children: ReactNode;
}

export function IPTrackerPageShell({ children }: IPTrackerPageShellProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
} 