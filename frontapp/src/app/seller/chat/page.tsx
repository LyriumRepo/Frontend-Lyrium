import { Suspense } from 'react';
import { ChatPageClient } from '@/features/seller/chat/ChatPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ChatPage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    // const conversations = await getConversations();
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando chat..." />}>
            <ChatPageClient />
        </Suspense>
    );
}
