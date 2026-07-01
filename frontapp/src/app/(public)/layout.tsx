import { PublicHeader, PublicFooter } from '@/components/layout/public';
// 1. Importamos el nuevo CartDrawer
import CartDrawer from '@/features/public/carrito/components/drawer/CartDrawer';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-[var(--bg-primary)] text-slate-900 dark:text-[var(--text-primary)]">
            <PublicHeader />
            
            <main className="flex-1 min-h-0 flex flex-col overflow-y-auto">
                {children}
            </main>
            
            <PublicFooter />
            
            {/* 2. Reemplazamos PublicCartDrawer por tu nuevo CartDrawer 
                que escucha a carritoStore.ui.cartOpen */}
            <CartDrawer />
            <ChatBotWidget />
        </div>
    );
}