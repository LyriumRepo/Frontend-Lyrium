import { useState, useCallback } from 'react';
import { CustomerConversation, CustomerMessage, CustomerChatFilters, ChatCategory } from '../types';

// ← Nuevo: lista de vendedores disponibles para seleccionar
export const mockSellers = [
    { id: 'seller-1', name: 'Juan Pérez',    store: 'Tienda Electrónica' },
    { id: 'seller-2', name: 'María García',  store: 'Moda Urbana'        },
    { id: 'seller-3', name: 'Carlos López',  store: 'Ferretería Central' },
];

const mockConversations: CustomerConversation[] = [
    {
        id: '1',
        sellerId: 'seller-1',
        sellerName: 'Juan Pérez',
        sellerStore: 'Tienda Electrónica',
        lastMessage: 'Gracias por su compra, estimado!',
        lastMessageTime: '2025-03-11T10:30:00',
        unreadCount: 2,
        status: 'active',
        category: 'logistica',        // ← agregar
        subject: 'Consulta de laptop'  // ← agregar
    },
    {
        id: '2',
        sellerId: 'seller-2',
        sellerName: 'María García',
        sellerStore: 'Moda Urbana',
        lastMessage: 'El producto ya fue enviado',
        lastMessageTime: '2025-03-10T15:45:00',
        unreadCount: 0,
        status: 'active',
        category: 'informacion',       // ← agregar
        subject: 'Estado de mi pedido' // ← agregar
    }
];

const mockMessages: Record<string, CustomerMessage[]> = {
    '1': [
        {
            id: 'm1',
            conversationId: '1',
            senderId: 'customer-1',
            senderName: 'Yo',
            senderType: 'customer',
            content: 'Hola, quiero información sobre el laptop',
            timestamp: '2025-03-11T10:00:00',
            read: true
        },
        {
            id: 'm2',
            conversationId: '1',
            senderId: 'seller-1',
            senderName: 'Juan Pérez',
            senderType: 'seller',
            content: 'Claro! El laptop tiene 16GB RAM y 512GB SSD',
            timestamp: '2025-03-11T10:15:00',
            read: true
        },
        {
            id: 'm3',
            conversationId: '1',
            senderId: 'customer-1',
            senderName: 'Yo',
            senderType: 'customer',
            content: 'Perfecto, lo tomo!',
            timestamp: '2025-03-11T10:20:00',
            read: true
        },
        {
            id: 'm4',
            conversationId: '1',
            senderId: 'seller-1',
            senderName: 'Juan Pérez',
            senderType: 'seller',
            content: 'Gracias por su compra, estimado!',
            timestamp: '2025-03-11T10:30:00',
            read: false
        }
    ],
    '2': [
        {
            id: 'm5',
            conversationId: '2',
            senderId: 'seller-2',
            senderName: 'María García',
            senderType: 'seller',
            content: 'El producto ya fue enviado',
            timestamp: '2025-03-10T15:45:00',
            read: false
        }
    ]
};

export function useCustomerChat() {
    const [conversations, setConversations] = useState<CustomerConversation[]>(mockConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [filters, setFilters] = useState<CustomerChatFilters>({
        status: 'all',
        search: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const messages = activeConversationId ? mockMessages[activeConversationId] || [] : [];

    const totalConversations = conversations.length;
    const criticalCount = conversations.filter(c => c.unreadCount > 0).length;
    const [isCreating, setIsCreating] = useState(false);

    const setActiveConversation = useCallback((id: string | null) => {
        setActiveConversationId(id);
        if (id) {
            setConversations(prev => prev.map(c =>
                c.id === id ? { ...c, unreadCount: 0 } : c
            ));
        }
    }, []);

    const sendMessage = useCallback((content: string) => {
        if (!activeConversationId) return;

        const newMessage: CustomerMessage = {
            id: `m${Date.now()}`,
            conversationId: activeConversationId,
            senderId: 'customer-1',
            senderName: 'Yo',
            senderType: 'customer',
            content,
            timestamp: new Date().toISOString(),
            read: true
        };

        if (!mockMessages[activeConversationId]) {
            mockMessages[activeConversationId] = [];
        }
        mockMessages[activeConversationId].push(newMessage);

        setConversations(prev => prev.map(c =>
            c.id === activeConversationId
                ? { ...c, lastMessage: content, lastMessageTime: new Date().toISOString() }
                : c
        ));
    }, [activeConversationId]);

    const clearActiveChat = useCallback(() => {
        setActiveConversationId(null);
    }, []);

    const archiveConversation = useCallback((id: string) => {
        setConversations(prev => prev.map(c =>
            c.id === id ? { ...c, status: 'archived' } : c
        ));
    }, []);

    // ← Nueva función
    const createConversation = useCallback(async (data: {
        sellerId: string;
        category: ChatCategory;
        subject: string;
    }) => {
        setIsCreating(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const seller = mockSellers.find(s => s.id === data.sellerId);
        if (!seller) { setIsCreating(false); return; }

        const newConversation: CustomerConversation = {
            id: `conv-${Date.now()}`,
            sellerId: seller.id,
            sellerName: seller.name,
            sellerStore: seller.store,
            lastMessage: data.subject,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            status: 'active',
            category: data.category,
            subject: data.subject,
        };

        mockMessages[newConversation.id] = [];
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setIsCreating(false);
    }, []);

    return {
        conversations,
        totalConversations,
        activeConversation: activeConversation || null,
        setActiveConversation,
        messages,
        isLoading,
        filters,
        setFilters,
        sendMessage,
        clearActiveChat,
        archiveConversation,
        isCreating,
        createConversation,
        criticalCount
    };
}
