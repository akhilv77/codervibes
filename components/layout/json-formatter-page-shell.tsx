'use client';

interface JSONFormatterPageShellProps {
    children: React.ReactNode;
}

export function JSONFormatterPageShell({ children }: JSONFormatterPageShellProps) {
    return (
        <main className="min-h-screen">
            {children}
        </main>
    );
} 