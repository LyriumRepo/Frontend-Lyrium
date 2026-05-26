import { useState, useCallback, useEffect } from 'react';
import { CustomerTicket, CustomerTicketMessage, CustomerTicketFilters, TicketStatus, TicketCategory } from '../types';
import { ticketApi, TicketData, TicketMessageData } from '@/shared/lib/api/ticketRepository';

function mapBackendStatus(status: string): TicketStatus {
  const map: Record<string, TicketStatus> = {
    'abierto': 'abierto',
    'proceso': 'proceso',
    'resuelto': 'resuelto',
    'cerrado': 'cerrado',
    'reabierto': 'abierto',
  };
  return map[status] || 'abierto';
}

function mapBackendCategory(category: string): TicketCategory {
  const valid: TicketCategory[] = ['critico', 'tecnico', 'negativo', 'informacion', 'positivo'];
  return valid.includes(category as TicketCategory) ? category as TicketCategory : 'informacion';
}

function mapTicketData(data: TicketData): CustomerTicket {
  return {
    id: String(data.id),
    ticketNumber: `TKT-${data.id_display}`,
    subject: data.titulo,
    description: data.descripcion,
    category: mapBackendCategory(data.type),
    status: mapBackendStatus(data.status),
    createdAt: '',
    updatedAt: '',
    messages: (data.mensajes ?? []).map(mapMessageData),
    unreadCount: data.mensajes_sin_leer,
    assignedTo: data.contacto_adm?.nombre ?? undefined,
  };
}

function mapMessageData(data: TicketMessageData): CustomerTicketMessage {
  return {
    id: String(data.id),
    ticketId: '',
    senderId: data.isUser ? 'self' : `agent_${data.id}`,
    senderName: data.user ?? '',
    senderType: data.isUser ? 'customer' : 'agent',
    content: data.texto ?? '',
    createdAt: data.timestamp ?? '',
  };
}

export function useCustomerSupport() {
  const [tickets, setTickets] = useState<CustomerTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerTicketFilters>({
    status: 'all',
    category: 'all',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTicket = tickets.find(t => t.id === activeTicketId) ?? null;
  const openTicketsCount = tickets.filter(t => t.status === 'abierto' || t.status === 'proceso').length;

  const loadTickets = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await ticketApi.list();
      setTickets(data.map(mapTicketData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const loadTicketDetail = useCallback(async (id: string) => {
    try {
      const data = await ticketApi.get(Number(id));
      if (data) {
        setTickets(prev => prev.map(t =>
          t.id === id ? { ...mapTicketData(data), messages: (data.mensajes ?? []).map(mapMessageData) } : t
        ));
      }
    } catch {
    }
  }, []);

  const setActiveTicketIdHandler = useCallback((id: string | null) => {
    setActiveTicketId(id);
    if (id) {
      loadTicketDetail(id);
    }
  }, [loadTicketDetail]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeTicketId) return;

    setIsSending(true);
    try {
      const newMessage = await ticketApi.sendMessage(Number(activeTicketId), content);
      const mappedMessage: CustomerTicketMessage = {
        id: String(newMessage.id),
        ticketId: activeTicketId,
        senderId: 'self',
        senderName: newMessage.user ?? '',
        senderType: 'customer',
        content: newMessage.texto ?? content,
        createdAt: new Date().toISOString(),
      };

      setTickets(prev => prev.map(t =>
        t.id === activeTicketId
          ? { ...t, messages: [...t.messages, mappedMessage] }
          : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  }, [activeTicketId]);

  const handleCreateTicket = useCallback(async (data: { subject: string; description: string; category: string }) => {
    setIsSending(true);
    try {
      const criticidadMap: Record<string, string> = {
        'critico': 'critica',
        'tecnico': 'media',
        'negativo': 'media',
        'informacion': 'baja',
        'positivo': 'baja',
      };

      const created = await ticketApi.create({
        asunto: data.subject,
        mensaje: data.description,
        tipo_ticket: data.category,
        criticidad: criticidadMap[data.category] || 'baja',
      });

      setTickets(prev => [mapTicketData(created), ...prev]);
      setActiveTicketId(String(created.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear ticket');
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleCloseTicket = useCallback(async (id: string) => {
    setIsClosing(true);
    try {
      await ticketApi.close(Number(id));
      setTickets(prev => prev.map(t =>
        t.id === id
          ? { ...t, status: 'cerrado' as TicketStatus, resolvedAt: new Date().toISOString() }
          : t
      ));
      setActiveTicketId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar ticket');
    } finally {
      setIsClosing(false);
    }
  }, []);

  return {
    tickets,
    activeTicket,
    activeTicketId,
    setActiveTicketId: setActiveTicketIdHandler,
    isLoading,
    isSending,
    isClosing,
    error,
    filters,
    setFilters,
    handleSendMessage,
    handleCreateTicket,
    handleCloseTicket,
    openTicketsCount,
    refresh: loadTickets,
  };
}
