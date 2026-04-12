import { useState, useCallback } from 'react';
import { CustomerTicket, CustomerTicketMessage, CustomerTicketFilters } from '../types';

const mockTickets: CustomerTicket[] = [
    {
        id: '1',
        ticketNumber: 'TKT-001',
        subject: 'Problema con mi pedido #12345',
        description: 'El pedido no llegó en la fecha esperada',
        category: 'order',
        priority: 'high',
        status: 'open',
        createdAt: '2025-03-10T09:00:00',
        updatedAt: '2025-03-11T10:30:00',
        messages: [
            {
                id: 'm1',
                ticketId: '1',
                senderId: 'customer-1',
                senderName: 'Yo',
                senderType: 'customer',
                content: 'Hola, mi pedido #12345 no llegó en la fecha esperada. ¿Pueden ayudarme?',
                createdAt: '2025-03-10T09:00:00'
            },
            {
                id: 'm2',
                ticketId: '1',
                senderId: 'agent-1',
                senderName: 'Soporte Lyrium',
                senderType: 'agent',
                content: 'Hola! Lamentamos la demora. Estamos investigando el estado de tu pedido. Te contactamos en breve.',
                createdAt: '2025-03-10T10:30:00'
            }
        ]
    },
    {
        id: '2',
        ticketNumber: 'TKT-002',
        subject: 'Consulta sobre garantía',
        description: 'Quiero saber los términos de garantía',
        category: 'general',
        priority: 'low',
        status: 'resolved',
        createdAt: '2025-03-05T14:00:00',
        updatedAt: '2025-03-06T09:00:00',
        resolvedAt: '2025-03-06T09:00:00',
        messages: [
            {
                id: 'm3',
                ticketId: '2',
                senderId: 'customer-1',
                senderName: 'Yo',
                senderType: 'customer',
                content: '¿Cuánto tiempo de garantía tiene el producto?',
                createdAt: '2025-03-05T14:00:00'
            },
            {
                id: 'm4',
                ticketId: '2',
                senderId: 'agent-1',
                senderName: 'Soporte Lyrium',
                senderType: 'agent',
                content: 'Todos nuestros productos tienen 12 meses de garantía por defecto. ¿Hay algo más que necesites saber?',
                createdAt: '2025-03-05T16:00:00'
            }
        ]
    }
];

export function useCustomerSupport() {
    const [tickets, setTickets] = useState<CustomerTicket[]>(mockTickets);
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const [filters, setFilters] = useState<CustomerTicketFilters>({
        status: 'all',
        category: 'all',
        search: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const activeTicket = tickets.find(t => t.id === activeTicketId);
    
    const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

    const setActiveTicketIdHandler = useCallback((id: string | null) => {
        setActiveTicketId(id);
    }, []);

    const handleSendMessage = useCallback(async (content: string) => {
        if (!activeTicketId) return;
        
        setIsSending(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newMessage: CustomerTicketMessage = {
            id: `m${Date.now()}`,
            ticketId: activeTicketId,
            senderId: 'customer-1',
            senderName: 'Yo',
            senderType: 'customer',
            content,
            createdAt: new Date().toISOString()
        };

        setTickets(prev => prev.map(t =>
            t.id === activeTicketId
                ? { 
                    ...t, 
                    messages: [...t.messages, newMessage],
                    updatedAt: new Date().toISOString()
                  }
                : t
        ));

        setIsSending(false);
    }, [activeTicketId]);

    const handleCreateTicket = useCallback(async (data: { subject: string; description: string; category: string; priority: string }) => {
        setIsSending(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newTicket: CustomerTicket = {
            id: `t${Date.now()}`,
            ticketNumber: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
            subject: data.subject,
            description: data.description,
            category: data.category as CustomerTicket['category'],
            priority: data.priority as CustomerTicket['priority'],
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: []
        };

        setTickets(prev => [newTicket, ...prev]);
        setActiveTicketId(newTicket.id);
        setIsSending(false);
    }, [tickets.length]);

    const handleCloseTicket = useCallback(async (id: string) => {
        setIsClosing(true);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setTickets(prev => prev.map(t =>
            t.id === id
                ? { 
                    ...t, 
                    status: 'closed' as const,
                    resolvedAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }
                : t
        ));
        
        if (activeTicketId === id) {
            setActiveTicketId(null);
        }
        
        setIsClosing(false);
    }, [activeTicketId]);

    return {
        tickets,
        activeTicket: activeTicket || null,
        activeTicketId,
        setActiveTicketId: setActiveTicketIdHandler,
        isLoading,
        isSending,
        isClosing,
        filters,
        setFilters,
        handleSendMessage,
        handleCreateTicket,
        handleCloseTicket,
        openTicketsCount
    };
}
