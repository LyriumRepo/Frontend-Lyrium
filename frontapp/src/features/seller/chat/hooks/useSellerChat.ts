import { useState, useCallback } from 'react';
import { SellerConversation, SellerMessage, SellerChatFilters, ChatCategory } from '../types';

export const mockCustomers = [
    { id: 'customer-1', name: 'Ana Torres' },
    { id: 'customer-2', name: 'Luis Ramírez' },
    { id: 'customer-3', name: 'Sofía Mendoza' },
];

const mockConversations: SellerConversation[] = [
    {
        id: '1',
        customerId: 'customer-1',
        customerName: 'Ana Torres',
        lastMessage: 'Gracias, esperaré el envío.',
        lastMessageTime: '2025-03-11T10:30:00',
        unreadCount: 2,
        status: 'active',
        category: 'logistica',
        subject: 'Consulta sobre envío'
    },
    {
        id: '2',
        customerId: 'customer-2',
        customerName: 'Luis Ramírez',
        lastMessage: '¿Tienen ese modelo en azul?',
        lastMessageTime: '2025-03-10T15:45:00',
        unreadCount: 0,
        status: 'active',
        category: 'informacion',
        subject: 'Disponibilidad de producto'
    }
];

const mockMessages: Record<string, SellerMessage[]> = {
    '1': [
        {
            id: 'm1',
            conversationId: '1',
            senderId: 'customer-1',
            senderName: 'Ana Torres',
            senderType: 'customer',
            content: 'Hola, ¿cuándo llega mi pedido?',
            timestamp: '2025-03-11T10:00:00',
            read: true
        },
        {
            id: 'm2',
            conversationId: '1',
            senderId: 'seller-1',
            senderName: 'Yo',
            senderType: 'seller',
            content: 'Hola Ana, tu pedido está en camino, llegará mañana.',
            timestamp: '2025-03-11T10:15:00',
            read: true
        },
        {
            id: 'm3',
            conversationId: '1',
            senderId: 'customer-1',
            senderName: 'Ana Torres',
            senderType: 'customer',
            content: 'Gracias, esperaré el envío.',
            timestamp: '2025-03-11T10:30:00',
            read: false
        }
    ],
    '2': [
        {
            id: 'm4',
            conversationId: '2',
            senderId: 'customer-2',
            senderName: 'Luis Ramírez',
            senderType: 'customer',
            content: '¿Tienen ese modelo en azul?',
            timestamp: '2025-03-10T15:45:00',
            read: false
        }
    ]
};

export function useSellerChat() {
    const [conversations, setConversations] = useState<SellerConversation[]>(mockConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [filters, setFilters] = useState<SellerChatFilters>({
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

        const newMessage: SellerMessage = {
            id: `m${Date.now()}`,
            conversationId: activeConversationId,
            senderId: 'seller-1',
            senderName: 'Yo',
            senderType: 'seller',
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

    const createConversation = useCallback(async (data: {
        customerId: string;
        category: ChatCategory;
        subject: string;
    }) => {
        setIsCreating(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const customer = mockCustomers.find(c => c.id === data.customerId);
        if (!customer) { setIsCreating(false); return; }

        const newConversation: SellerConversation = {
            id: `conv-${Date.now()}`,
            customerId: customer.id,
            customerName: customer.name,
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
