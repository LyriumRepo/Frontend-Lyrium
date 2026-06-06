import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomerTicket, CustomerTicketMessage, CustomerTicketFilters } from '../types';
import { ticketApi } from '@/lib/api/ticketRepository';
import type { Ticket, TicketMessage, TicketPriority } from '@/modules/helpdesk/types';

type CreateData = {
  subject: string;
  description: string;
  category: CustomerTicket['category'];
  priority: TicketPriority;
};

function toCustomerTicket(t: Ticket): CustomerTicket {
  return {
    id: String(t.id),
    ticketNumber: t.numero || t.id_display,
    subject: t.titulo,
    description: t.descripcion,
    category: (t.categoria || t.type || 'info') as CustomerTicket['category'],
    priority: (t.prioridad || 'media') as CustomerTicket['priority'],
    status: mapStatus(t.status || t.estado || 'abierto'),
    createdAt: t.fecha_creacion || t.created_at || '',
    updatedAt: t.fecha_actualizacion || t.updated_at || '',
    messages: (t.mensajes || []).map(toCustomerMessage),
  };
}

function toCustomerMessage(m: TicketMessage): CustomerTicketMessage {
  const isAgent = m.role?.toLowerCase() === 'admin';
  return {
    id: String(m.id),
    ticketId: String(m.id),
    senderId: m.user || '0',
    senderName: m.usuario || m.user || 'Usuario',
    senderType: isAgent ? 'agent' : 'customer',
    content: m.contenido || m.texto || '',
    createdAt: m.timestamp || m.hora || '',
  };
}

function mapStatus(s: string): CustomerTicket['status'] {
  switch (s) {
    case 'abierto': return 'open';
    case 'proceso': return 'in_progress';
    case 'resuelto': return 'resolved';
    case 'cerrado': return 'closed';
    case 'reabierto': return 'open';
    default: return 'open';
  }
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

  const fetchTicketDetail = useCallback(async (id: string) => {
    try {
      const data = await ticketApi.customer.get(Number(id));
      const mapped = toCustomerTicket(data);
      setTickets((prev) => prev.map((t) => (t.id === id ? mapped : t)));
    } catch {
      // silent
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await ticketApi.customer.list();
      setTickets(data.map(toCustomerTicket));
    } catch {
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (activeTicketId) {
      fetchTicketDetail(activeTicketId);
    }
  }, [activeTicketId, fetchTicketDetail]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  const openTicketsCount = useMemo(
    () => tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
    [tickets],
  );

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeTicketId) return;
    setIsSending(true);
    const tempMsg: CustomerTicketMessage = {
      id: `temp-${Date.now()}`,
      ticketId: activeTicketId,
      senderId: '',
      senderName: 'Tú',
      senderType: 'customer',
      content,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeTicketId ? { ...t, messages: [...t.messages, tempMsg] } : t,
      ),
    );
    try {
      await ticketApi.customer.sendMessage(Number(activeTicketId), { content });
      await fetchTicketDetail(activeTicketId);
    } catch {
      await fetchTicketDetail(activeTicketId).catch(() => {});
    } finally {
      setIsSending(false);
    }
  }, [activeTicketId, fetchTicketDetail]);

  const handleCreateTicket = useCallback(async (data: CreateData) => {
    setIsSending(true);
    try {
      const created = await ticketApi.customer.create({
        asunto: data.subject,
        mensaje: data.description,
        tipo_ticket: data.category,
        criticidad: data.priority,
      });
      const mapped = toCustomerTicket(created);
      setTickets((prev) => [mapped, ...prev]);
      setActiveTicketId(mapped.id);
    } catch {
      // silent
    } finally {
      setIsSending(false);
    }
  }, []);

  const handleCloseTicket = useCallback(async (id: string) => {
    setIsClosing(true);
    try {
      await ticketApi.customer.close(Number(id));
      setTickets((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: 'closed' as const } : t,
        ),
      );
      setActiveTicketId(null);
    } catch {
      // silent
    } finally {
      setIsClosing(false);
    }
  }, []);

  return {
    tickets,
    activeTicket,
    activeTicketId,
    setActiveTicketId,
    isLoading,
    isSending,
    isClosing,
    filters,
    setFilters,
    handleSendMessage,
    handleCreateTicket,
    handleCloseTicket,
    openTicketsCount,
  };
}
