import { PublicHeader, PublicFooter } from '@/components/layout/public';
import PublicCartDrawer from '@/components/home/PublicCartDrawer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[var(--bg-primary)] text-slate-900 dark:text-[var(--text-primary)]">
            <PublicHeader />
            <main className="flex-1">
                {children}
            </main>
            <PublicFooter />
            <PublicCartDrawer />
        </div>
    );
}