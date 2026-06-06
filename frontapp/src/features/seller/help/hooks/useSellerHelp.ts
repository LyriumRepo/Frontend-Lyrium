import { useState, useCallback } from 'react';
import { SellerTicket, SellerTicketMessage, SellerTicketFilters } from '../types';

const mockTickets: SellerTicket[] = [
    {
        id: '1',
        ticketNumber: 'TKT-001',
        subject: 'Problema con la publicación de producto',
        description: 'No puedo subir imágenes a mi listing',
        category: 'tecnico',
        status: 'open',
        createdAt: '2025-03-10T09:00:00',
        updatedAt: '2025-03-11T10:30:00',
        messages: [
            {
                id: 'm1',
                ticketId: '1',
                senderId: 'seller-1',
                senderName: 'Yo',
                senderType: 'seller',
                content: 'Hola, tengo problemas para subir imágenes a mis productos. ¿Pueden ayudarme?',
                createdAt: '2025-03-10T09:00:00'
            },
            {
                id: 'm2',
                ticketId: '1',
                senderId: 'agent-1',
                senderName: 'Soporte Lyrium',
                senderType: 'agent',
                content: 'Hola! Lamentamos el inconveniente. Estamos revisando el problema con las imágenes. Te contactamos en breve.',
                createdAt: '2025-03-10T10:30:00'
            }
        ]
    },
    {
        id: '2',
        ticketNumber: 'TKT-002',
        subject: 'Consulta sobre comisiones',
        description: 'Quiero entender el detalle de las comisiones aplicadas',
        category: 'informacion',
        status: 'resolved',
        createdAt: '2025-03-05T14:00:00',
        updatedAt: '2025-03-06T09:00:00',
        resolvedAt: '2025-03-06T09:00:00',
        messages: [
            {
                id: 'm3',
                ticketId: '2',
                senderId: 'seller-1',
                senderName: 'Yo',
                senderType: 'seller',
                content: '¿Pueden explicarme cómo se calculan las comisiones por venta?',
                createdAt: '2025-03-05T14:00:00'
            },
            {
                id: 'm4',
                ticketId: '2',
                senderId: 'agent-1',
                senderName: 'Soporte Lyrium',
                senderType: 'agent',
                content: 'La comisión estándar es del 8% sobre el precio de venta. Puedes ver el detalle completo en la sección de facturación de tu panel.',
                createdAt: '2025-03-05T16:00:00'
            }
        ]
    }
];

export function useSellerHelp() {
    const [tickets, setTickets] = useState<SellerTicket[]>(mockTickets);
    const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
    const [filters, setFilters] = useState<SellerTicketFilters>({
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

        const newMessage: SellerTicketMessage = {
            id: `m${Date.now()}`,
            ticketId: activeTicketId,
            senderId: 'seller-1',
            senderName: 'Yo',
            senderType: 'seller',
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

    const handleCreateTicket = useCallback(async (data: { subject: string; description: string; category: string }) => {
        setIsSending(true);

        await new Promise(resolve => setTimeout(resolve, 500));

        const newTicket: SellerTicket = {
            id: `t${Date.now()}`,
            ticketNumber: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
            subject: data.subject,
            description: data.description,
            category: data.category as SellerTicket['category'],
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
