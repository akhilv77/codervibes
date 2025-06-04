import { generateAppMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: { params: { appId: string } }): Promise<any> {
    return generateAppMetadata(params.appId);
}

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
} 