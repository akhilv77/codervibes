'use client';

import { PageShell } from '@/components/layout/page-shell';

export function JWTDecoderPageShell({ children }: { children: React.ReactNode }) {
    return (
        <PageShell>
            {children}
        </PageShell>
    );
} 